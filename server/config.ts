// Configuration file for the application
export const config = {
  // Storage type: 'memory' | 'file' | 'postgres'
  storageType: process.env.STORAGE_TYPE || 'memory',
  
  // Database configuration (only used if storageType is 'postgres')
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
  },
  
  // Gemini AI configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || 'localhost',
  },
  
  // File storage configuration (only used if storageType is 'file')
  fileStorage: {
    dataDir: process.env.DATA_DIR || './data',
  },
};

// Helper function to get storage instance
export function getStorageType() {
  return config.storageType;
}

// Helper function to check if using database
export function isUsingDatabase() {
  return config.storageType === 'postgres';
}

// Helper function to check if using file storage
export function isUsingFileStorage() {
  return config.storageType === 'file';
}

// Helper function to check if using memory storage
export function isUsingMemoryStorage() {
  return config.storageType === 'memory';
}
