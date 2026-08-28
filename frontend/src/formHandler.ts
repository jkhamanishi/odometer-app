import { submitOdometerData, convertToBase64, type Payload } from './api';
import { getSelectedFile, resetFileUI } from './fileHandler';

export function initFormHandler(): void {
  const form = document.getElementById('odometerForm') as HTMLFormElement | null;
  const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;
  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;
  const statusText = document.getElementById('status') as HTMLParagraphElement | null;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (!form) return;

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    if (!statusText || !submitBtn || !odometerInput || !readingDateInput || !readingTimeInput) return;

    statusText.innerText = 'Uploading data...';
    submitBtn.disabled = true;

    const selectedFile = getSelectedFile();
    let base64Image: string | null = null;
    let fileName: string | null = null;

    if (selectedFile) {
      fileName = selectedFile.name;
      base64Image = await convertToBase64(selectedFile);
    }

    const payload: Payload = {
      odometer: odometerInput.value,
      readingDate: readingDateInput.value,
      readingTime: readingTimeInput.value,
      image: base64Image,
      fileName: fileName
    };

    try {
      const result = await submitOdometerData(payload);

      if (result.status === 'success') {
        statusText.innerText = 'Submitted successfully!';
        form.reset();
        resetFileUI();
      } else {
        statusText.innerText = `Error: ${result.message || 'Unknown error'}`;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      statusText.innerText = `Submission failed: ${errorMessage}`;
    } finally {
      submitBtn.disabled = false;
    }
  });
}