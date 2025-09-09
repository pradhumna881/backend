const fs = require('fs');
const path = require('path');

class ContentLoader {
  constructor() {
    this.contentPath = path.join(__dirname, 'addictions');
    this.cache = new Map();
  }

  // Load content with simple caching
  loadContent(addictionId) {
    try {
      // Check cache first
      if (this.cache.has(addictionId)) {
        return this.cache.get(addictionId);
      }

      const filePath = path.join(this.contentPath, `${addictionId}.json`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`Content file not found: ${filePath}`);
        return null;
      }

      // Read and parse file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const content = JSON.parse(fileContent);

      // Cache the content
      this.cache.set(addictionId, content);

      return content;
    } catch (error) {
      console.error(`Error loading content for ${addictionId}:`, error);
      return null;
    }
  }

  // Get all available addiction IDs
  getAllAddictionIds() {
    try {
      if (!fs.existsSync(this.contentPath)) {
        console.warn(`Content directory not found: ${this.contentPath}`);
        return [];
      }

      const files = fs.readdirSync(this.contentPath);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Error reading content directory:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new ContentLoader();
