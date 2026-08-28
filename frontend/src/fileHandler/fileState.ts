let selectedFile: File | null = null;

export function getSelectedFile(): File | null {
  return selectedFile;
}

export function setSelectedFile(file: File | null): void {
  selectedFile = file;
}