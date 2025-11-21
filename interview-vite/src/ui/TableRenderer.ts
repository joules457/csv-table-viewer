import type { CSVRow, SortState } from '../types';
import { SortManager } from '../domain/SortManager';

/**
 * Handles rendering and interaction of CSV data in an HTML table.
 * Manages sorting state and updates the DOM accordingly.
 */
export class TableRenderer {
  /** Reference to the rendered table element */
  private table?: HTMLTableElement;

  /** Array of column header names */
  private headers: string[] = [];

  /** Maps column names to their current sort state */
  private sortState: Record<string, SortState> = {};

  /** Instance of SortManager for data sorting operations */
  private sortManager = new SortManager();

  /** Container element where the table will be rendered */
  private container: HTMLElement;

  /** Element to display selected rows */
  private selectedRowsDisplay?: HTMLParagraphElement;

  /**
   * Creates a new TableRenderer instance.
   *
   * @param container - DOM element where the table will be rendered
   */
  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Renders a complete table with CSV data.
   * Clears any existing content and creates a fresh table with headers and rows.
   *
   * @param rows - Array of CSV rows to display
   * @param headers - Optional array of column headers. If not provided, inferred from data
   *
   * @example
   * ```typescript
   * const renderer = new TableRenderer(document.getElementById('app'));
   * renderer.render([
   *   { name: 'Alice', age: 25 },
   *   { name: 'Bob', age: 30 }
   * ]);
   * ```
   */
  render(rows: CSVRow[], headers?: string[]) {
    // Use provided headers or infer from data
    if (!headers) headers = this.inferHeaders(rows);
    this.headers = headers;

    // Initialize sort state for all columns
    this.sortState = {};
    headers.forEach((h) => (this.sortState[h] = 'none'));

    // Clear existing content
    this.container.innerHTML = '';

    // Create table structure
    const table = document.createElement('table');
    table.className = 'csv-table';

    // Create table header
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    // Add checkbox header (first column)
    const checkboxHeader = document.createElement('th');
    checkboxHeader.textContent = '';
    tr.appendChild(checkboxHeader);

    // Create header cells with click handlers
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      th.dataset.col = h; // Store column name for reference
      th.style.cursor = 'pointer'; // Indicate clickability
      th.addEventListener('click', () => this.onHeaderClick(h, rows));
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    // Create empty table body (will be filled by updateBody)
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    // Add table to container
    this.container.appendChild(table);
    this.table = table;

    // Create paragraph element to display selected rows
    const selectedRowsDisplay = document.createElement('p');
    selectedRowsDisplay.id = 'selected-rows-display';
    selectedRowsDisplay.textContent = 'Rows Selected: none';
    this.container.appendChild(selectedRowsDisplay);
    this.selectedRowsDisplay = selectedRowsDisplay;

    // Populate table with data
    this.updateBody(rows);
  }

  /**
   * Infers column headers from the data by collecting all unique keys.
   * Useful when headers are not explicitly provided.
   *
   * @param rows - Array of CSV rows
   * @returns Array of unique column names found in the data
   *
   * @example
   * ```typescript
   * inferHeaders([
   *   { name: 'Alice', age: 25 },
   *   { name: 'Bob', city: 'NYC' }
   * ]);
   * // Returns: ['name', 'age', 'city']
   * ```
   */
  private inferHeaders(rows: CSVRow[]): string[] {
    if (!rows.length) return [];

    // Collect all unique keys across all rows
    const keys = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((k) => keys.add(k)));

    return Array.from(keys);
  }

  /**
   * Updates the table body with new row data.
   * Replaces all existing rows with the provided data.
   *
   * @param rows - Array of CSV rows to display
   */
  private updateBody(rows: CSVRow[]) {
    if (!this.table) return;

    const tbody = this.table.querySelector('tbody')!;
    tbody.innerHTML = ''; // Clear existing rows

    // Create a row for each data item
    rows.forEach((row) => {
      const tr = document.createElement('tr');

      // Create checkbox cell (first column)
      const checkboxCell = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('click', () => this.onCheckboxClick(tr));
      checkboxCell.appendChild(checkbox);
      tr.appendChild(checkboxCell);

      // Create cells in header order
      this.headers.forEach((h) => {
        const td = document.createElement('td');
        // Display empty string for null values
        td.textContent = row[h] === null ? '' : String(row[h]);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  /**
   * Handles checkbox click events.
   * Updates the visual state of the row based on selection.
   *
   * @param row - The table row element that contains the checkbox
   */
  private onCheckboxClick(row: HTMLTableRowElement) {
    // Get all cells (td elements) in this row
    const cells = row.getElementsByTagName('td');
    
    // Toggle selected class on the row
    row.classList.toggle('selected');
    
    // Update all cells in the row (simple but effective update)
    Array.from(cells).forEach((cell) => {
      cell.classList.toggle('selected');
    });

    // Get selected rows data and update display
    this.updateSelectedRowsDisplay();
  }

  /**
   * Updates the display of selected rows and logs them to console.
   */
  private updateSelectedRowsDisplay() {
    if (!this.table || !this.selectedRowsDisplay) return;

    // Get all selected rows (rows with 'selected' class)
    const selectedRows = this.table.querySelectorAll('tbody tr.selected');
    const selectedData: CSVRow[] = [];

    selectedRows.forEach((tr) => {
      const cells = tr.getElementsByTagName('td');
      const rowData: CSVRow = {};

      // Skip first cell (checkbox), process rest as data
      for (let i = 1; i < cells.length; i++) {
        const header = this.headers[i - 1];
        const cellValue = cells[i].textContent || '';
        // Try to parse as number if possible, otherwise keep as string
        rowData[header] = cellValue === '' ? null : cellValue;
      }

      selectedData.push(rowData);
    });

    // Log to console
    console.log('Rows Selected:', selectedData);

    // Update paragraph display
    if (selectedData.length === 0) {
      this.selectedRowsDisplay.textContent = 'Rows Selected: none';
    } else {
      const displayText = selectedData
        .map((row, index) => {
          const values = Object.values(row).filter((v) => v !== null);
          return `${index + 1}. ${values.join(' - ')}`;
        })
        .join(' | ');
      this.selectedRowsDisplay.textContent = `Rows Selected: ${displayText}`;
    }
  }

  /**
   * Handles click events on table headers.
   * Cycles through sort states and updates the table accordingly.
   *
   * @param column - Name of the clicked column
   * @param originalRows - Original unsorted data for re-sorting
   */
  private onHeaderClick(column: string, originalRows: CSVRow[]) {
    // Get current sort state and calculate next state
    const current = this.sortState[column];
    const next = this.sortManager.toggleSort(current);

    // Reset all columns to 'none' (single column sort only)
    Object.keys(this.sortState).forEach((k) => (this.sortState[k] = 'none'));
    this.sortState[column] = next;

    // Update visual indicators
    this.updateHeaderVisuals();

    // Sort data and re-render body
    const sorted = this.sortManager.sortData(originalRows, column, next);
    this.updateBody(sorted);
  }

  /**
   * Updates the visual appearance of table headers based on sort state.
   * Adds sort indicators (↑ ↓) and applies CSS classes.
   */
  private updateHeaderVisuals() {
    if (!this.table) return;

    const ths = this.table.querySelectorAll('th');
    ths.forEach((th) => {
      const col = th.dataset.col;
      // Skip checkbox header (doesn't have dataset.col)
      if (!col) return;

      const state = this.sortState[col];

      // Add 'sorted' class for styled columns
      th.classList.toggle('sorted', state !== 'none');

      // Add visual sort indicator
      const sortIcon = state === 'asc' ? '↑' : state === 'desc' ? '↓' : '';
      th.innerHTML = `${col} ${sortIcon}`;
    });
  }
}
