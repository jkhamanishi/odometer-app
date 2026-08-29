import { handleFormSubmit } from './formSubmitHandler';

const GAS_DEPLOYMENT_ID_STORAGE_KEY = 'gasDeploymentId';
const USERNAME_STORAGE_KEY = 'username';

export function initFormHandler(): void {
  const form = document.getElementById('odometerForm') as HTMLFormElement | null;
  const usernameInput = document.getElementById('username') as HTMLInputElement | null;
  const gasDeploymentIdInput = document.getElementById('gasDeploymentId') as HTMLInputElement | null;
  const recordTypeInputs = document.querySelectorAll<HTMLInputElement>('input[name="recordType"]');
  const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;
  const readingDateInput = document.getElementById('readingDate') as HTMLInputElement | null;
  const readingTimeInput = document.getElementById('readingTime') as HTMLInputElement | null;
  const statusText = document.getElementById('status') as HTMLParagraphElement | null;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;

  if (
    !form ||
    !statusText ||
    !submitBtn ||
    !usernameInput ||
    !gasDeploymentIdInput ||
    !recordTypeInputs.length ||
    !odometerInput ||
    !readingDateInput ||
    !readingTimeInput
  ) return;

  usernameInput.value = localStorage.getItem(USERNAME_STORAGE_KEY) ?? '';
  gasDeploymentIdInput.value = localStorage.getItem(GAS_DEPLOYMENT_ID_STORAGE_KEY) ?? '';

  form.addEventListener('submit', (e: SubmitEvent) => {
    handleFormSubmit(e, {
      statusText,
      submitBtn,
      usernameInput,
      gasDeploymentIdInput,
      recordTypeInputs,
      odometerInput,
      readingDateInput,
      readingTimeInput
    });
  });
}
