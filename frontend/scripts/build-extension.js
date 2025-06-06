import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const distDir = path.resolve(path.join(__dirname, '..', 'dist'));
const publicDir = path.resolve(path.join(__dirname, '..', 'public'));

// Ensure the manifest.json is copied to the dist directory
function copyManifest() {
  const manifestPath = path.join(publicDir, 'manifest.json');
  const destPath = path.join(distDir, 'manifest.json');
  
  try {
    // Read the manifest file
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Write the manifest to the dist directory
    fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2));
    console.log('✅ manifest.json copied to dist/');
  } catch (error) {
    console.error('❌ Error copying manifest.json:', error);
  }
}

// Copy any other static assets needed for the extension
function copyStaticAssets() {
  const assetsToCopy = [
    { src: path.join(publicDir, 'favicon.ico'), dest: path.join(distDir, 'favicon.ico') },
    { src: path.join(publicDir, 'robots.txt'), dest: path.join(distDir, 'robots.txt') },
    // Add any other assets you need to copy
  ];
  
  assetsToCopy.forEach(({ src, dest }) => {
    try {
      fs.copyFileSync(src, dest);
      console.log(`✅ ${path.basename(src)} copied to dist/`);
    } catch (error) {
      console.error(`❌ Error copying ${path.basename(src)}:`, error);
    }
  });

  // Copy icons directory
  copyIconsDirectory();
}

// Copy icons directory
function copyIconsDirectory() {
  const sourceIconsDir = path.join(publicDir, 'icons');
  const destIconsDir = path.join(distDir, 'icons');
  
  // Create icons directory in dist if it doesn't exist
  if (!fs.existsSync(destIconsDir)) {
    fs.mkdirSync(destIconsDir, { recursive: true });
  }
  
  // Map the existing icon files to the expected icon files in manifest.json
  const iconMappings = [
    { src: 'favicon-16x16.png', dest: 'icon16.png' },
    { src: 'favicon-32x32.png', dest: 'icon32.png' },
    { src: 'android-chrome-192x192.png', dest: 'icon48.png' }, // Using larger icon and it will be scaled down
    { src: 'android-chrome-512x512.png', dest: 'icon128.png' }
  ];
  
  // Copy and rename icon files
  iconMappings.forEach(({ src, dest }) => {
    try {
      fs.copyFileSync(
        path.join(sourceIconsDir, src),
        path.join(destIconsDir, dest)
      );
      console.log(`✅ Icon ${src} copied to dist/icons/${dest}`);
    } catch (error) {
      console.error(`❌ Error copying icon ${src}:`, error);
    }
  });
  
  // Also copy all original icon files to maintain the original structure
  try {
    const iconFiles = fs.readdirSync(sourceIconsDir);
    iconFiles.forEach(file => {
      fs.copyFileSync(
        path.join(sourceIconsDir, file),
        path.join(destIconsDir, file)
      );
      console.log(`✅ Original icon ${file} copied to dist/icons/`);
    });
  } catch (error) {
    console.error('❌ Error copying original icons:', error);
  }
}

// Main function
function buildExtension() {
  console.log('🔨 Building extension...');
  copyManifest();
  copyStaticAssets();
  console.log('✨ Extension build completed!');
}

// Run the build
buildExtension();