import html2canvas from 'html2canvas';
import { SizeType, TemplateType } from '../types';

export async function captureElementAsCanvas(
  element: HTMLElement,
  size: SizeType
): Promise<HTMLCanvasElement> {
  const scale = size === 'portrait' ? 2.25 : 2;

  return html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string
): void {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export async function exportCardAsImage(
  element: HTMLElement,
  size: SizeType,
  filename: string = 'podcast-card'
): Promise<void> {
  const canvas = await captureElementAsCanvas(element, size);
  downloadCanvasAsImage(canvas, filename);
}

export async function exportMultipleAsImages(
  elements: { element: HTMLElement; filename: string }[],
  size: SizeType,
  onProgress?: (index: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < elements.length; i++) {
    const { element, filename } = elements[i];
    const canvas = await captureElementAsCanvas(element, size);
    downloadCanvasAsImage(canvas, filename);
    if (onProgress) {
      onProgress(i + 1, elements.length);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export const templateNames: Record<TemplateType, string> = {
  dark: '深色播客风',
  note: '知识笔记风',
  retro: '复古磁带风',
  minimal: '极简时间轴风',
};

export function getExportDimensions(size: SizeType): { width: number; height: number } {
  switch (size) {
    case 'portrait':
      return { width: 480, height: 854 };
    case 'square':
      return { width: 540, height: 540 };
    default:
      return { width: 480, height: 854 };
  }
}
