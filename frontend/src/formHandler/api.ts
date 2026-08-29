export interface Payload {
  odometer: string;
  recordType: string;
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

export async function callAPI(deploymentId: string, payload: Payload): Promise<ApiResponse> {
  const scriptUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;

  const response = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  return response.json();
}

