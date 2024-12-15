import type { TextSettings } from '../types/editor';

let texts: TextSettings[] = [];

// Function to render text with proper styling
function renderText(ctx: CanvasRenderingContext2D, text: TextSettings, canvasWidth: number, canvasHeight: number) {
    ctx.save();
    
    // Scale font size relative to image height
    const scaleFactor = canvasHeight / 1000;
    const scaledFontSize = text.fontSize * scaleFactor;
    
    // Set font and color
    ctx.font = `${scaledFontSize}px ${text.fontFamily}`;
    ctx.fillStyle = text.color;
    
    // Calculate absolute positions in pixels
    const xPos = (canvasWidth * (text.x + 50)) / 100;
    const yPos = (canvasHeight * (text.y + 50)) / 100;
    
    // Move to position and rotate
    ctx.translate(xPos, yPos);
    ctx.rotate((text.rotation * Math.PI) / 180);
    
    // Center the text
    const metrics = ctx.measureText(text.content);
    ctx.fillText(text.content, -metrics.width / 2, scaledFontSize / 3);
    
    ctx.restore();
}

export function setupImageProcessor() {
    const processButton = document.getElementById('process-button') as HTMLButtonElement;
    const canvas = document.getElementById('processing-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const imagePreview = document.getElementById('image-preview') as HTMLImageElement;

    async function processImage() {
        if (!ctx || !imagePreview.complete) return;

        // Set canvas size to match image
        canvas.width = imagePreview.naturalWidth;
        canvas.height = imagePreview.naturalHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(imagePreview, 0, 0);

        // Sort texts by z-index
        const sortedTexts = [...texts].sort((a, b) => a.z - b.z);

        // Draw each text
        sortedTexts.forEach(text => {
            renderText(ctx, text, canvas.width, canvas.height);
        });

        try {
            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed'));
                    }
                }, 'image/png');
            });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'behind-the-mask-image.png';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving image:', error);
            alert('Error saving image. Please try again.');
        }
    }

    // Add click handler for process button
    processButton?.removeEventListener('click', processImage);  // Remove any existing listeners
    processButton?.addEventListener('click', processImage);

    // Wait for image to load before allowing processing
    imagePreview.addEventListener('load', () => {
        if (processButton) {
            processButton.disabled = false;
        }
    });

    // Initially disable process button
    if (processButton) {
        processButton.disabled = true;
    }
}

export function updateTexts(newTexts: TextSettings[]) {
    texts = newTexts;
}
