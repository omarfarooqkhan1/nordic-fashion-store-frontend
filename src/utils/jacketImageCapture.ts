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
      console.log('Found Three.js canvas, using direct capture');
      // Use the Three.js canvas directly
      return threeCanvas.toDataURL('image/png', quality);
    } else {
      console.log('No Three.js canvas found, falling back to html2canvas');
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
    console.error('Error capturing jacket canvas:', error);
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
    console.log('Starting jacket design capture...');
    console.log('Front canvas element:', frontCanvas);
    console.log('Back canvas element:', backCanvas);
    
    const [frontImage, backImage] = await Promise.all([
      captureJacketCanvas(frontCanvas, options),
      captureJacketCanvas(backCanvas, options)
    ]);

    console.log('Jacket design captured successfully');
    console.log('Front image length:', frontImage.length);
    console.log('Back image length:', backImage.length);

    return { frontImage, backImage };
  } catch (error) {
    console.error('Error capturing jacket design:', error);
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
