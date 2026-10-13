/**
 * Utilidad para comprimir imágenes de evidencia en el navegador antes de enviarlas al backend.
 * Redimensiona a un máximo de 1400px (ancho o alto) manteniendo la relación de aspecto,
 * y comprime a JPEG calidad 0.8.
 *
 * @param {File} file - Objeto File del input file
 * @param {number} maxWidth - Ancho máximo (default 1400)
 * @param {number} maxHeight - Alto máximo (default 1400)
 * @param {number} quality - Calidad JPEG de 0 a 1 (default 0.8)
 * @returns {Promise<{ nombre_archivo: string, mime_type: string, tamano_bytes: number, foto_base64: string }>}
 */
export const comprimirImagen = (file, maxWidth = 1400, maxHeight = 1400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error('El archivo no es una imagen válida'));
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Redimensionar proporcionalmente
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                // Calcular tamaño aproximado en bytes desde base64
                const base64Str = dataUrl.split(',')[1] || '';
                const tamanoBytes = Math.round((base64Str.length * 3) / 4);

                resolve({
                    nombre_archivo: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                    mime_type: "image/jpeg",
                    tamano_bytes: tamanoBytes,
                    foto_base64: dataUrl
                });
            };
            img.onerror = () => reject(new Error('Error al decodificar la imagen'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
};
