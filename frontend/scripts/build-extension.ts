import * as fs from 'fs';
import * as path from 'path';

// Paths
const distDir = path.resolve('dist');
const publicDir = path.resolve('public');

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