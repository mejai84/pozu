import sharp from 'sharp';

async function cropImage() {
    try {
        const info = await sharp('public/images/logo_3.png')
            .trim()
            .toFile('public/images/logo_cropped.png');
        console.log('Imagen recortada con éxito:', info);
    } catch (error) {
        console.error('Error recortando la imagen:', error);
    }
}

cropImage();
