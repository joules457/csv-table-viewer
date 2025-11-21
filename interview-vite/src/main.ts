import './style.css';
import { FileHandler } from './services/FileHandler';
import { ParserService } from './services/ParserService';
import { TableRenderer } from './ui/TableRenderer';

const fileInput = document.getElementById('file-input') as HTMLInputElement;
const status = document.getElementById('status') as HTMLElement;
const container = document.getElementById('table-container') as HTMLElement;

const fileHandler = new FileHandler();
const parser = new ParserService();
const renderer = new TableRenderer(container);

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  try {
    status.textContent = 'Processing Data...';
    fileHandler.validateFile(file);

    const { rows, headers } = await parser.parseCSV(file);

    status.textContent = `Parsed ${rows.length} rows`;
    renderer.render(rows, headers);
  } catch (err) {
    status.textContent = `Error: ${(err as Error).message}`;
  }
});
