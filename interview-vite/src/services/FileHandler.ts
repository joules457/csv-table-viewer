export class FileHandler {
  private maxSizeBytes = 5_000_000;

  validateFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Invalid file type. Please upload a CSV file.');
    }

    if (file.size > this.maxSizeBytes) {
      throw new Error(`File size exceeds the limit of ${this.maxSizeBytes} bytes.`);
    }
  }
}
