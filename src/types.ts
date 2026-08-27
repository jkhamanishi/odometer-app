export interface Payload {
  odometer: string;
  image: string | null;
  fileName: string | null;
}

export interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  fileUrl?: string;
}