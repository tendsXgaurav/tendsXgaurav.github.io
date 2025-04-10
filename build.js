const fs = require('fs');
const path = require('path');
const htmlMinify = require('html-minifier').minify;

// Define the public directory
const publicDir = path.join(__dirname, 'public');

// Process all HTML files
async function processAllHTML() {
  try {
    const htmlFiles = ['chat_page.html', 'home_page.html'];
    
    for (const htmlFile of htmlFiles) {
      const htmlPath = path.join(__dirname, htmlFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Minify HTML
      const minifiedHTML = htmlMinify(htmlContent, {
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: false, // We'll handle JS separately
        minifyCSS: false, // We'll handle CSS separately
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      });
      
      // Save minified HTML
      fs.writeFileSync(path.join(publicDir, htmlFile), minifiedHTML);
    }
    
    console.log('HTML files processed successfully');
  } catch (err) {
    console.error('Error processing HTML files:', err);
  }
}

// Update the build function to call the new processAllHTML function
async function build() {
  console.log('Building for production...');
  await processAllHTML();
  await processJS();
  await processCSS();
  
  console.log('Build completed successfully!');
}

module.exports = {
  build
};