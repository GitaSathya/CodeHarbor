import { config } from './config';
import { storage as memoryStorage } from './storage';
import { fileStorage } from './fileStorage';

// Storage factory that automatically selects the right implementation
export function createStorage() {
  switch (config.storageType) {
    case 'file':
      console.log('📁 Using file-based storage with persistence');
      return fileStorage;
    
    case 'postgres':
      console.log('🗄️ Using PostgreSQL database storage');
      // Import and return PostgreSQL storage when needed
      throw new Error('PostgreSQL storage not yet implemented. Use "memory" or "file" for now.');
    
    case 'memory':
    default:
      console.log('🧠 Using in-memory storage (data will be lost on server restart)');
      return memoryStorage;
  }
}

// Export the default storage instance
export const storage = createStorage();

// Export individual storage types for direct access if needed
export { memoryStorage, fileStorage };
