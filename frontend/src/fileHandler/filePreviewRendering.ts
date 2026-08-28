import type { ProcessDebugSteps } from '../imageProcessing';

export function renderCroppedPreview(croppedCanvas: HTMLCanvasElement): void {
  const previewContainer = document.getElementById('croppedPreviewContainer');
  const previewWrapper = document.getElementById('croppedPreviewWrapper');

  if (previewContainer && previewWrapper) {
    previewWrapper.innerHTML = '';
    const img = document.createElement('img');
    img.src = croppedCanvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    previewWrapper.appendChild(img);
    previewContainer.style.display = 'block';
  }
}

export function renderProcessedPreview(finalCanvas: HTMLCanvasElement): void {
  const container = document.getElementById('processedPreviewContainer');
  const wrapper = document.getElementById('processedPreviewWrapper');

  if (container && wrapper) {
    wrapper.innerHTML = '';
    const img = document.createElement('img');
    img.src = finalCanvas.toDataURL('image/png');
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';

    wrapper.appendChild(img);
    container.style.display = 'block';
    const processingDetails = document.getElementById('imageProcessingDetails') as HTMLDetailsElement | null;
    if (processingDetails) processingDetails.style.display = 'block';
  }
}

export function renderIntermediateSteps(debugSteps: ProcessDebugSteps): void {
  const debugContainer = document.getElementById('debugOcrContainer') as HTMLDetailsElement | null;
  const debugWrapper = document.getElementById('debugOcrWrapper');

  if (!debugContainer || !debugWrapper) return;

  debugWrapper.innerHTML = '';

  debugSteps.forEach((step) => {
    const stepBox = document.createElement('div');
    stepBox.style.width = '100%';
    stepBox.style.boxSizing = 'border-box';

    const label = document.createElement('p');
    label.innerText = step.title;
    label.style.fontSize = '0.8rem';
    label.style.margin = '0 0 4px 0';
    label.style.fontWeight = 'bold';
    label.style.color = '#444';
    label.style.textAlign = 'left';

    const img = document.createElement('img');
    img.src = step.canvas.toDataURL('image/png');
    img.style.width = '100%';
    img.style.display = 'block';
    img.style.border = '1px solid #999';
    img.style.borderRadius = '4px';
    img.style.background = '#fff';

    stepBox.appendChild(label);
    stepBox.appendChild(img);
    debugWrapper.appendChild(stepBox);
  });

  debugContainer.open = false;
  debugContainer.style.display = 'block';
}