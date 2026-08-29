import { handleFormSubmit } from './formSubmitHandler';

const GAS_DEPLOYMENT_ID_STORAGE_KEY = 'gasDeploymentId';

export function initFormHandler(): void {
  const form = document.getElementById('odometerForm') as HTMLFormElement | null;
  const gasDeploymentIdInput = document.getElementById('gasDeploymentId') as HTMLInputElement | null;
  const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;
  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;
  const statusText = document.getElementById('status') as HTMLParagraphElement | null;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (
    !form ||
    !statusText ||
    !submitBtn ||
    !gasDeploymentIdInput ||
    !odometerInput ||
    !readingDateInput ||
    !readingTimeInput
  ) return;

  gasDeploymentIdInput.value = localStorage.getItem(GAS_DEPLOYMENT_ID_STORAGE_KEY) ?? '';

  form.addEventListener('submit', (e: SubmitEvent) => {
    handleFormSubmit(e, {
      statusText,
      submitBtn,
      gasDeploymentIdInput,
      odometerInput,
      readingDateInput,
      readingTimeInput
    });
  });
}
