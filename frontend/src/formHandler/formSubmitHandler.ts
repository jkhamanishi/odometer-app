import { callAPI, type Payload } from './api';
import { getSelectedFile, resetFileUI } from '../fileHandler';
import { fileToBase64 } from './fileToBase64';

const GAS_DEPLOYMENT_ID_STORAGE_KEY = 'gasDeploymentId';

interface FormElements {
  statusText: HTMLParagraphElement;
  submitBtn: HTMLButtonElement;
  gasDeploymentIdInput: HTMLInputElement;
  recordTypeInputs: NodeListOf<HTMLInputElement>;
  odometerInput: HTMLInputElement;
  readingDateInput: HTMLInputElement;
  readingTimeInput: HTMLInputElement;
}

export async function handleFormSubmit(
  e: SubmitEvent,
  elements: FormElements
): Promise<void> {
  e.preventDefault();

  const {
    statusText,
    submitBtn,
    gasDeploymentIdInput,
    recordTypeInputs,
    odometerInput,
    readingDateInput,
    readingTimeInput
  } = elements;

  const gasDeploymentId = gasDeploymentIdInput.value.trim();
  const recordType = Array.from(recordTypeInputs).find((input) => input.checked)?.value ?? '';

  if (!gasDeploymentId) {
    statusText.innerText = 'Please enter your GAS deployment ID.';
    return;
  }

  if (!recordType) {
    statusText.innerText = 'Please choose a record type.';
    return;
  }

  localStorage.setItem(GAS_DEPLOYMENT_ID_STORAGE_KEY, gasDeploymentId);

  statusText.innerText = 'Uploading data...';
  submitBtn.disabled = true;

  const selectedFile = getSelectedFile();
  let base64Image: string | null = null;
  let fileName: string | null = null;

  if (selectedFile) {
    fileName = selectedFile.name;
    base64Image = await fileToBase64(selectedFile);
  }

  const payload: Payload = {
    odometer: odometerInput.value,
    recordType: recordType,
    readingDate: readingDateInput.value,
    readingTime: readingTimeInput.value,
    image: base64Image,
    fileName: fileName
  };

  try {
    const result = await callAPI(gasDeploymentId, payload);

    if (result.status === 'success') {
      statusText.innerText = 'Submitted successfully!';
      odometerInput.closest('form')?.reset();
      gasDeploymentIdInput.value = gasDeploymentId;
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
}
