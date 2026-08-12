# CTBC Prospect Batch Converter

Standalone CTBC prospect workbook preparation utility.

Authority: CTBC-PROSPECT-BATCH-001

Source mapping:
Họ tên -> full_name
SĐT liên hệ -> phone
Mã định danh Bộ GD&ĐT -> student_number
country -> Vietnam

Unavailable canonical fields remain blank.

Phone and student_number are written as TEXT.

This utility prepares upload files only.
It does not modify GE runtime, Prospect schema, database,
campaign infrastructure, Zalo, or communications.

Raw prospect files must remain outside Git.
