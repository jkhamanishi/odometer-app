import { Payload, ApiResponse } from './types';

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export async function submitOdometerData(payload: Payload): Promise<ApiResponse> {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}