import './style.css';
import { initFileHandlers } from './fileHandler';
import { initFormHandler } from './formHandler';

const odometerInput = document.getElementById('odometer') as HTMLInputElement | null;

// Initialize file inputs and auto-fill odometer when OCR finishes
initFileHandlers((detectedReading) => {
  if (odometerInput) {
    odometerInput.value = detectedReading;
  }
});

// Initialize form submission workflow
initFormHandler();