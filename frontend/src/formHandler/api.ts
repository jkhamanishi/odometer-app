export interface Payload {
  odometer: string;
  readingDate: string;
  readingTime: string;
  image: string | null;
  fileName: string | null;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  fileUrl?: string;
}

const SCRIPT_ID = import.meta.env.VITE_GAS_DEPLOYMENT_ID;
const SCRIPT_URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

export async function callAPI(payload: Payload): Promise<ApiResponse> {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

