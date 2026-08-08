// =============================================================================
// Generated type patch — APP-SCHEMA-003
// Append to / merge into server/supabase-types.ts
// =============================================================================
// These types satisfy the import contract declared at the top of supabase-dal.ts:
//   import type { ProspectDocument, ProspectDocumentInsert, ProspectDocumentUpdate }

export interface ProspectDocument {
  id:            string;
  prospect_id:   string;
  document_type: string;
  file_name:     string;
  storage_path:  string | null;
  description:   string | null;
  archived:      boolean;
  created_at:    string;
  updated_at:    string;
}

export interface ProspectDocumentInsert {
  prospect_id:   string;
  document_type: string;
  file_name:     string;
  storage_path?: string | null;
  description?:  string | null;
  archived?:     boolean;
}

export interface ProspectDocumentUpdate {
  document_type?: string;
  file_name?:     string;
  storage_path?:  string | null;
  description?:   string | null;
  archived?:      boolean;
}
