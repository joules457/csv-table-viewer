import type { CSVRow, SortState } from '../types';

/**
 * Manages sorting operations for CSV data.
 * Provides stable sorting with support for numbers, strings, and null values.
 */
export class SortManager {
  /**
   * Type guard to check if a value is a finite number.
   *
   * @param value - Value to check
   * @returns true if value is a finite number, false otherwise
   *
   * @example
   * ```typescript
   * isNumber(42)        // true
   * isNumber('42')      // false
   * isNumber(NaN)       // false
   * isNumber(Infinity)  // false
   * ```
   */
  private isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
  }

  /**
   * Compares two values for sorting purposes.
   * Handles null values, numbers, and strings with localized comparison.
   *
   * @param valueA - First value to compare
   * @param valueB - Second value to compare
   * @returns Negative if A < B, positive if A > B, zero if equal
   *
   * @example
   * ```typescript
   * compareValues(1, 2)           // -1 (A < B)
   * compareValues('apple', 'zoo') // negative (A < B)
   * compareValues(null, 5)        // 1 (null goes last)
   * compareValues('10', '2')      // -1 (numeric comparison)
   * ```
   */
  private compareValues(valueA: unknown, valueB: unknown): number {
    // Handle null values - nulls sort to the end
    if (valueA === null && valueB === null) return 0;
    if (valueA === null) return 1; // A is null, B is not → A goes after B
    if (valueB === null) return -1; // B is null, A is not → A goes before B

    // Handle numeric comparison
    if (this.isNumber(valueA) && this.isNumber(valueB)) {
      return valueA - valueB;
    }

    // Handle string comparison with locale-aware sorting
    const stringA = String(valueA);
    const stringB = String(valueB);
    return stringA.localeCompare(stringB, undefined, {
      numeric: true, // '10' comes after '2'
      sensitivity: 'base', // Case-insensitive comparison
    });
  }

  /**
   * Applies sort direction to a comparison result.
   *
   * @param compareResult - Result from compareValues
   * @param direction - Sort direction ('asc' or 'desc')
   * @returns Modified comparison result based on direction
   */
  private applySortDirection(compareResult: number, direction: SortState): number {
    return direction === 'asc' ? compareResult : -compareResult;
  }

  /**
   * Sorts an array of CSV rows by a specific column.
   * Implements stable sort - rows with equal values maintain original order.
   *
   * @param rows - Array of CSV rows to sort
   * @param column - Column name to sort by
   * @param state - Sort state: 'asc', 'desc', or 'none'
   * @returns New sorted array (original array is not modified)
   *
   * @example
   * ```typescript
   * const rows = [
   *   { name: 'Bob', age: 30 },
   *   { name: 'Alice', age: 25 }
   * ];
   *
   * sortData(rows, 'age', 'asc')
   * // [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }]
   *
   * sortData(rows, 'name', 'none')
   * // Returns copy of original array
   * ```
   */
  sortData(rows: CSVRow[], column: string, state: SortState): CSVRow[] {
    // If no sorting requested, return a copy of the original array
    if (state === 'none') {
      return rows.slice();
    }

    // Create indexed rows to maintain stable sort
    const indexedRows = rows.map((row, originalIndex) => ({
      row,
      originalIndex,
    }));

    // Sort with stable tiebreaker
    indexedRows.sort((a, b) => {
      const valueA = a.row[column];
      const valueB = b.row[column];

      const compareResult = this.compareValues(valueA, valueB);

      // Use original index as tiebreaker for stable sort
      // This ensures rows with equal values maintain their original order
      if (compareResult === 0) {
        return a.originalIndex - b.originalIndex;
      }

      return this.applySortDirection(compareResult, state);
    });

    // Extract sorted rows without index information
    return indexedRows.map(({ row }) => row);
  }

  /**
   * Cycles through sort states in order: none → asc → desc → none.
   *
   * @param currentSort - Current sort state
   * @returns Next sort state in the cycle
   *
   * @example
   * ```typescript
   * toggleSort('none') // 'asc'
   * toggleSort('asc')  // 'desc'
   * toggleSort('desc') // 'none'
   * ```
   */
  toggleSort(currentSort: SortState): SortState {
    switch (currentSort) {
      case 'none':
        return 'asc';
      case 'asc':
        return 'desc';
      case 'desc':
        return 'none';
    }
  }
}
