import { handleFormSubmit } from './formSubmitHandler';

export function initFormHandler(): void {
  const form = document.getElementById('odometerForm') as HTMLFormElement | null;
  const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;
  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;
  const statusText = document.getElementById('status') as HTMLParagraphElement | null;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (!form || !statusText || !submitBtn || !odometerInput || !readingDateInput || !readingTimeInput) return;

  form.addEventListener('submit', (e: SubmitEvent) => {
    handleFormSubmit(e, {
      statusText,
      submitBtn,
      odometerInput,
      readingDateInput,
      readingTimeInput
    });
  });
}
