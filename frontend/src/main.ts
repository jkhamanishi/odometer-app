import './style.css';
import { initFileHandlers } from './fileHandler';
import { initFormHandler } from './formHandler';

// Initialize file inputs and auto-fill odometer when OCR finishes
initFileHandlers();

// Initialize form submission workflow
initFormHandler();