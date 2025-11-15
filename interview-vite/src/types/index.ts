export type SortState = 'asc' | 'desc' | 'none';
export type CSVPrimitive = string | number | boolean | null;

export interface CSVRow {
  [column: string]: CSVPrimitive;
}

export interface ParseResult {
  rows: CSVRow[];
  headers: string[];
}
