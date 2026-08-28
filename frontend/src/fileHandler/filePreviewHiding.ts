export function hideProcessingDetails(): void {
  const processingDetails = document.getElementById('imageProcessingDetails') as HTMLDetailsElement | null;

  if (processingDetails) {
    processingDetails.open = false;
    processingDetails.style.display = 'none';
  }
}

export function hideProcessedPreview(): void {
  const container = document.getElementById('processedPreviewContainer');
  const wrapper = document.getElementById('processedPreviewWrapper');

  if (wrapper) wrapper.innerHTML = '';
  if (container) container.style.display = 'none';
}

export function hideIntermediateSteps(): void {
  const debugContainer = document.getElementById('debugOcrContainer') as HTMLDetailsElement | null;
  const debugWrapper = document.getElementById('debugOcrWrapper');

  if (debugWrapper) debugWrapper.innerHTML = '';
  if (debugContainer) {
    debugContainer.open = false;
    debugContainer.style.display = 'none';
  }
}

export function hideAllProcessingPreviews(): void {
  hideIntermediateSteps();
  hideProcessedPreview();
  hideProcessingDetails();
}