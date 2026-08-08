/**
 * GE-EXEC-004B-REV3 — Minimal dependency-free .xlsx reader.
 *
 * Scope / known limitations (documented rather than hidden):
 *   - Reads the FIRST worksheet only (xl/worksheets/sheet1.xml). Workbooks
 *     with the data on a later sheet, or with sheet1.xml re-ordered via
 *     xl/workbook.xml, are not resolved — this reads the first worksheet
 *     part in the archive by that fixed name.
 *   - Only the ZIP "stored" (0) and "deflate" (8) compression methods are
 *     supported. Both are what Excel/LibreOffice/Google Sheets produce.
 *   - Legacy binary .xls (pre-2007 OLE format) is NOT an xlsx/ZIP file at
 *     all and is explicitly rejected — it is a different binary format
 *     entirely and would need a separate parser.
 *   - Cell values are read as displayed text (shared strings, inline
 *     strings, or raw numeric/text <v> content). Formulas are read as
 *     their cached <v> result, not re-evaluated.
 *   - No external packages are used — only Node's built-in `zlib`.
 *
 * Output shape matches csv-import.ts's parseCsv(): an array of
 * lower-cased-header-keyed row objects, so the same row-validation /
 * mapping / duplicate-detection pipeline can be reused for both formats.
 */

import { inflateRawSync } from 'zlib';

interface ZipEntry {
  fileName: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
}

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_FILE_SIGNATURE = 0x04034b50;

function findEndOfCentralDirectory(buf: Buffer): number {
  // EOCD is a fixed 22-byte record (+ optional comment) at the tail.
  // Comments are capped at 65535 bytes, so search the tail window only.
  const searchStart = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= searchStart; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  throw new Error('Not a valid .xlsx file: ZIP end-of-central-directory record not found.');
}

function readCentralDirectory(buf: Buffer): ZipEntry[] {
  const eocdOffset = findEndOfCentralDirectory(buf);
  const entryCount = buf.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);

  const entries: ZipEntry[] = [];
  let offset = centralDirOffset;

  for (let i = 0; i < entryCount; i++) {
    if (buf.readUInt32LE(offset) !== CENTRAL_DIR_SIGNATURE) {
      throw new Error('Not a valid .xlsx file: malformed ZIP central directory.');
    }
    const compressionMethod = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const fileNameLength = buf.readUInt16LE(offset + 28);
    const extraFieldLength = buf.readUInt16LE(offset + 30);
    const fileCommentLength = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);
    const fileName = buf.toString('utf8', offset + 46, offset + 46 + fileNameLength);

    entries.push({ fileName, compressionMethod, compressedSize, localHeaderOffset });

    offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function extractEntry(buf: Buffer, entry: ZipEntry): Buffer {
  const off = entry.localHeaderOffset;
  if (buf.readUInt32LE(off) !== LOCAL_FILE_SIGNATURE) {
    throw new Error(`Not a valid .xlsx file: malformed local file header for ${entry.fileName}.`);
  }
  const nameLength = buf.readUInt16LE(off + 26);
  const extraLength = buf.readUInt16LE(off + 28);
  const dataStart = off + 30 + nameLength + extraLength;
  const compressed = buf.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) return compressed; // stored, no compression
  if (entry.compressionMethod === 8) return inflateRawSync(compressed); // deflate
  throw new Error(`Unsupported ZIP compression method (${entry.compressionMethod}) for ${entry.fileName}.`);
}

/** Decode the small set of XML entities used in spreadsheetml text content. */
function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&'); // must be last
}

/** xl/sharedStrings.xml -> ordered array of string values (index = <si> position). */
function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];
  const strings: string[] = [];
  const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let siMatch: RegExpExecArray | null;
  while ((siMatch = siRegex.exec(xml))) {
    const siBody = siMatch[1];
    const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let text = '';
    let tMatch: RegExpExecArray | null;
    while ((tMatch = tRegex.exec(siBody))) {
      text += decodeXmlEntities(tMatch[1]);
    }
    strings.push(text);
  }
  return strings;
}

/** Converts a spreadsheet column reference ("A", "B", ... "AA") to a 0-based index. */
function columnLetterToIndex(letters: string): number {
  let index = 0;
  for (let i = 0; i < letters.length; i++) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }
  return index - 1;
}

interface RawCell {
  colIndex: number;
  value: string;
}

function parseRowCells(rowXml: string, sharedStrings: string[]): RawCell[] {
  const cells: RawCell[] = [];
  const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g;
  let match: RegExpExecArray | null;

  while ((match = cellRegex.exec(rowXml))) {
    const attrs = match[1] ?? match[3] ?? '';
    const body = match[2] ?? '';

    const refMatch = /r="([A-Z]+)\d+"/.exec(attrs);
    if (!refMatch) continue;
    const colIndex = columnLetterToIndex(refMatch[1]);

    const typeMatch = /t="([^"]+)"/.exec(attrs);
    const cellType = typeMatch ? typeMatch[1] : null;

    let value = '';
    if (cellType === 's') {
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
      const idx = vMatch ? parseInt(vMatch[1], 10) : NaN;
      value = Number.isFinite(idx) ? (sharedStrings[idx] ?? '') : '';
    } else if (cellType === 'inlineStr') {
      const tMatch = /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(body);
      value = tMatch ? decodeXmlEntities(tMatch[1]) : '';
    } else {
      const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
      value = vMatch ? decodeXmlEntities(vMatch[1]) : '';
    }

    cells.push({ colIndex, value });
  }

  return cells;
}

/**
 * Parses an .xlsx buffer into header-keyed row objects, matching
 * csv-import.ts's parseCsv() output shape. Reads the first worksheet only.
 */
export function parseXlsx(buffer: Buffer): Record<string, string>[] {
  if (buffer.length < 4 || buffer.readUInt32LE(0) !== LOCAL_FILE_SIGNATURE) {
    throw new Error(
      'File is not a valid .xlsx (ZIP-based) workbook. Legacy .xls files are not supported — please save as .xlsx.',
    );
  }

  const entries = readCentralDirectory(buffer);

  const sheetEntry = entries.find((e) => e.fileName === 'xl/worksheets/sheet1.xml');
  if (!sheetEntry) {
    throw new Error('Could not find xl/worksheets/sheet1.xml in the workbook.');
  }
  const sharedStringsEntry = entries.find((e) => e.fileName === 'xl/sharedStrings.xml');

  const sheetXml = extractEntry(buffer, sheetEntry).toString('utf8');
  const sharedStringsXml = sharedStringsEntry
    ? extractEntry(buffer, sharedStringsEntry).toString('utf8')
    : null;
  const sharedStrings = parseSharedStrings(sharedStringsXml);

  const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  const rawRows: RawCell[][] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(sheetXml))) {
    rawRows.push(parseRowCells(rowMatch[1], sharedStrings));
  }

  if (rawRows.length < 2) return [];

  const headerCells = rawRows[0];
  const maxCol = headerCells.reduce((max, c) => Math.max(max, c.colIndex), -1);
  const headers: string[] = [];
  for (let i = 0; i <= maxCol; i++) headers[i] = '';
  headerCells.forEach((c) => {
    headers[c.colIndex] = c.value.toLowerCase().trim();
  });

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < rawRows.length; r++) {
    const cellsByCol = new Map<number, string>();
    rawRows[r].forEach((c) => cellsByCol.set(c.colIndex, c.value));

    const isEmptyRow = rawRows[r].every((c) => c.value.trim() === '');
    if (isEmptyRow) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      row[h] = cellsByCol.get(idx) ?? '';
    });
    rows.push(row);
  }

  return rows;
}
