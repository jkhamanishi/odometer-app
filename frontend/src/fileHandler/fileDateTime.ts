import exifr from 'exifr';
import { getSelectedFile } from './fileState';

export async function populateReadingDateTime(file: File): Promise<void> {
  const fallbackDate = new Date(file.lastModified);
  setReadingDateTime(fallbackDate);

  try {
    const metadata = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate'] });
    const metadataDate = metadata?.DateTimeOriginal ?? metadata?.CreateDate;

    if (getSelectedFile() !== file || !metadataDate) return;

    const parsedDate = metadataDate instanceof Date ? metadataDate : new Date(metadataDate);
    setReadingDateTime(parsedDate);
  } catch {
    // The file may not contain readable EXIF metadata; keep the modified date fallback.
  }
}

function setReadingDateTime(date: Date): void {
  if (Number.isNaN(date.getTime())) return;

  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;

  if (readingDateInput) {
    readingDateInput.value = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((value, index) => index === 0 ? String(value).padStart(4, '0') : String(value).padStart(2, '0'))
      .join('-');
  }

  if (readingTimeInput) {
    readingTimeInput.value = [date.getHours(), date.getMinutes()]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  }
}