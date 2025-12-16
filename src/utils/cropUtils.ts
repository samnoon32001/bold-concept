export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any,
  rotation = 0
): Promise<File> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to match the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Calculate the scale to fit the entire image in the crop area
  const scaleX = image.width / image.naturalWidth;
  const scaleY = image.height / image.naturalHeight;
  
  // Clear canvas with white background to prevent transparency
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Save the context state
  ctx.save();
  
  // Move to center of canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Apply rotation
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Calculate the source rectangle with proper scaling
  const sourceX = (pixelCrop.x / scaleX);
  const sourceY = (pixelCrop.y / scaleY);
  const sourceWidth = (pixelCrop.width / scaleX);
  const sourceHeight = (pixelCrop.height / scaleY);
  
  // Ensure source dimensions don't exceed image boundaries
  const clampedSourceX = Math.max(0, Math.min(sourceX, image.naturalWidth - sourceWidth));
  const clampedSourceY = Math.max(0, Math.min(sourceY, image.naturalHeight - sourceHeight));
  const clampedSourceWidth = Math.min(sourceWidth, image.naturalWidth - clampedSourceX);
  const clampedSourceHeight = Math.min(sourceHeight, image.naturalHeight - clampedSourceY);
  
  // Draw the image with proper source and destination rectangles
  ctx.drawImage(
    image,
    clampedSourceX,
    clampedSourceY,
    clampedSourceWidth,
    clampedSourceHeight,
    -pixelCrop.width / 2,
    -pixelCrop.height / 2,
    pixelCrop.width,
    pixelCrop.height
  );
  
  // Restore the context state
  ctx.restore();

  // Convert canvas to blob and then to File
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      },
      'image/jpeg',
      0.95 // Slightly reduce quality for better performance
    );
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });
