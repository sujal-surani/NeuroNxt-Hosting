/**
 * Compresses an image file client-side using HTML Canvas.
 * - Converts to WebP
 * - Resizes to max width of 1024px
 * - Reduces quality to 0.7
 * 
 * @param file The original File object
 * @returns Promise<File> The compressed File object
 */
export async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        // 1. Check if it's an image
        if (!file.type.startsWith('image/')) {
            return reject(new Error('File is not an image'));
        }

        // 2. Create an image element to load the file
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = (e) => reject(e);

        img.onload = () => {
            // 3. Create canvas for resizing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            // 4. Calculate new dimensions (Max width 1024px)
            const MAX_WIDTH = 1024;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;

            // 5. Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);

            // 6. Convert to Blob (WebP, 0.7 quality)
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        return reject(new Error('Compression failed'));
                    }

                    // 7. Create new File object
                    // Change extension to .webp
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const compressedFile = new File([blob], newName, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                },
                'image/webp',
                0.7 // Quality (0.0 - 1.0)
            );
        };

        img.onerror = (e) => reject(e);

        // Start reading
        reader.readAsDataURL(file);
    });
}
