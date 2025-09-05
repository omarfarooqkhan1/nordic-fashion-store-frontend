import html2canvas from 'html2canvas';

interface JacketImageCaptureOptions {
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

/**
 * Capture the jacket canvas as an image using Three.js renderer
 * This avoids WebGL context loss issues with html2canvas
 */
export const captureJacketCanvas = async (
  canvasElement: HTMLElement,
  options: JacketImageCaptureOptions = {}
): Promise<string> => {
  const {
    quality = 0.9,
    scale = 2,
    backgroundColor = '#ffffff'
  } = options;

  try {
    // Look for a Three.js canvas within the element
    const threeCanvas = canvasElement.querySelector('canvas');
    
    if (threeCanvas) {
      // Use the Three.js canvas directly
      return threeCanvas.toDataURL('image/png', quality);
    } else {
      // Fallback to html2canvas if no Three.js canvas found
      const canvas = await html2canvas(canvasElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor,
        scale,
        logging: false,
        width: canvasElement.offsetWidth,
        height: canvasElement.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure the cloned element has the same dimensions
          const clonedElement = clonedDoc.querySelector('[data-jacket-canvas]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = `${canvasElement.offsetWidth}px`;
            clonedElement.style.height = `${canvasElement.offsetHeight}px`;
          }
        }
      });

      return canvas.toDataURL('image/png', quality);
    }
  } catch (error) {
    throw new Error('Failed to capture jacket design');
  }
};

/**
 * Capture both front and back views of the jacket
 */
export const captureJacketDesign = async (
  frontCanvas: HTMLElement,
  backCanvas: HTMLElement,
  options: JacketImageCaptureOptions = {}
): Promise<{ frontImage: string; backImage: string }> => {
  try {
    
    const [frontImage, backImage] = await Promise.all([
      captureJacketCanvas(frontCanvas, options),
      captureJacketCanvas(backCanvas, options)
    ]);


    return { frontImage, backImage };
  } catch (error) {
    throw new Error('Failed to capture jacket design');
  }
};

/**
 * Generate a unique filename for the jacket design
 */
export const generateJacketFilename = (
  color: string,
  timestamp: number = Date.now()
): string => {
  const colorName = color.replace('#', '').toLowerCase();
  return `custom-jacket-${colorName}-${timestamp}`;
};
