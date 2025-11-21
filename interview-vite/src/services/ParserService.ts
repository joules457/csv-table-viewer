import Papa from 'papaparse';

import type { ParseResult, CSVRow, CSVPrimitive } from '../types';

/**
 * Service responsible for parsing CSV files into structured data.
 * Uses PapaParse library for robust CSV parsing with worker support.
 */
export class ParserService {
  /**
   * Parses a CSV file and returns structured data with headers and rows.
   *
   * @param file - The CSV file to parse
   * @returns Promise resolving to parsed data with headers and rows
   * @throws Error if parsing fails or if the CSV contains errors
   *
   * @example
   * ```typescript
   * const parser = new ParserService();
   * const result = await parser.parseCSV(file);
   * console.log(result.headers); // ['Name', 'Age', 'City']
   * console.log(result.rows);    // [{ Name: 'John', Age: 30, City: 'NYC' }]
   * ```
   */
  async parseCSV(file: File): Promise<ParseResult> {
    return new Promise<ParseResult>((resolve, reject) => {
      Papa.parse<Record<string, string>>(file, {
        header: true, // Use first row as headers
        skipEmptyLines: true, // Ignore empty rows
        worker: false, // Disable worker to allow custom transform functions
        delimiter: '',
        newline: undefined, // Auto-detect newline (LF, CRLF, or CR)
        quoteChar: '"', // Standard quote character
        escapeChar: '"', // Standard escape character
        dynamicTyping: false, // Keep all values as strings for custom parsing
        complete: (results) => {
          this.handleParseComplete(results, resolve, reject);
        },
        error: (err) => reject(err),
      });
    });
  }

  /**
   * Handles the completion of CSV parsing.
   * Validates results, extracts headers, and transforms rows.
   *
   * @param results - Raw parsing results from PapaParse
   * @param resolve - Promise resolve function
   * @param reject - Promise reject function
   */
  private handleParseComplete(
    results: Papa.ParseResult<Record<string, string>>,
    resolve: (value: ParseResult) => void,
    reject: (reason?: Error) => void
  ): void {
    // Check for parsing errors (only critical ones)
    if (this.hasCriticalErrors(results)) {
      const errorMessage = results.errors
        .filter((e) => e.type === 'Quotes' || e.type === 'Delimiter')
        .map((e) => e.message)
        .join(', ');
      return reject(new Error(errorMessage || 'Unknown parsing error'));
    }

    // Extract and transform data
    const headers = this.extractHeaders(results);
    const rows = this.transformRows(results.data);

    resolve({ rows, headers });
  }
  /**
   * Checks if the parsing results contain critical errors.
   * Ignores field mismatch warnings as they're often false positives.
   *
   * @param results - Raw parsing results from PapaParse
   * @returns true if critical errors exist, false otherwise
   */
  private hasCriticalErrors(results: Papa.ParseResult<Record<string, string>>): boolean {
    if (!results.errors || results.errors.length === 0) {
      return false;
    }

    // Only consider critical errors, ignore field count mismatches
    return results.errors.some((error) => error.type !== 'FieldMismatch');
  }

  /**
   * Extracts and cleans header names from parsing results.
   *
   * @param results - Raw parsing results from PapaParse
   * @returns Array of trimmed header strings
   */
  private extractHeaders(results: Papa.ParseResult<Record<string, string>>): string[] {
    return results.meta.fields ? results.meta.fields.map((header) => header.trim()) : [];
  }

  /**
   * Transforms all rows from raw string data to typed CSVRow objects.
   *
   * @param data - Array of raw row data as string records
   * @returns Array of transformed CSVRow objects with typed values
   */
  private transformRows(data: Record<string, string>[]): CSVRow[] {
    return data.map((row) => this.transformRow(row));
  }

  /**
   * Transforms a single row from raw strings to typed values.
   * Trims keys and parses values to appropriate types (number, string, null).
   *
   * @param row - Raw row data as string record
   * @returns Transformed row with typed values
   */
  private transformRow(row: Record<string, string>): CSVRow {
    const transformedRow: CSVRow = {};

    // Transform each column value
    for (const key of Object.keys(row)) {
      const trimmedKey = key.trim();
      transformedRow[trimmedKey] = this.parseValue(row[key]);
    }

    return transformedRow;
  }

  /**
   * Parses a raw string value into its appropriate type.
   * Attempts to convert to number if possible, otherwise returns trimmed string.
   *
   * @param rawValue - Raw string value from CSV
   * @returns Parsed value as number, string, or null
   *
   * @example
   * ```typescript
   * parseValue('123')    // returns 123 (number)
   * parseValue('hello')  // returns 'hello' (string)
   * parseValue('')       // returns null
   * parseValue('12.5')   // returns 12.5 (number)
   * ```
   */
  /**
   * Parses a raw string value into its appropriate type.
   * Attempts to convert to number if possible, otherwise returns trimmed string.
   *
   * @param rawValue - Raw string value from CSV
   * @returns Parsed value as number, string, or null
   *
   * @example
   * ```typescript
   * parseValue('123')    // returns 123 (number)
   * parseValue('hello')  // returns 'hello' (string)
   * parseValue('')       // returns null
   * parseValue('12.5')   // returns 12.5 (number)
   * ```
   */
  private parseValue(rawValue: string): CSVPrimitive {
    // Handle null, undefined, or empty values
    if (rawValue == null || rawValue === '') {
      return null;
    }

    // Convert to string if not already (safety check)
    const stringValue = String(rawValue).trim();

    // Handle empty string after trim
    if (stringValue === '') {
      return null;
    }

    // Try to parse as number
    const numericValue = Number(stringValue);
    return Number.isFinite(numericValue) ? numericValue : stringValue;
  }
}
