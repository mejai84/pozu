import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateFavicon() {
  const inputImage = path.resolve('public', 'images', 'logo_cropped.png');
  const fallbackImage = path.resolve('public', 'images', 'logo_2_0.png');

  const sourcePath = fs.existsSync(inputImage) ? inputImage : fallbackImage;

  if (!fs.existsSync(sourcePath)) {
    console.error('No logo found to generate favicon');
    return;
  }

  // Generate a standard icon.png for Next.js App Router (which works great)
  const outputPath = path.resolve('src', 'app', 'icon.png');
  const appleIconPath = path.resolve('src', 'app', 'apple-icon.png');

  try {
    // Generate 32x32 for standard use or leave 192x192 as generic
    await sharp(sourcePath)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent background
      })
      .png()
      .toFile(outputPath);

    console.log(`Successfully generated ${outputPath}`);

    // Generate Apple Touch Icon (180x180 with solid or transparent bg)
    await sharp(sourcePath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 10, alpha: 1 } // slight dark bg for iOS
      })
      .png()
      .toFile(appleIconPath);
      
    console.log(`Successfully generated ${appleIconPath}`);
  } catch (err) {
    console.error('Error generating favicons:', err);
  }
}

generateFavicon();
