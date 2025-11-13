import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { initializeSchema } from './schema.js';

let db: Database.Database | null = null;

export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'data');
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return path.join(dbDir, 'postboy.db');
}

export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    const dbPath = getDatabasePath();
    db = new Database(dbPath);
    
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    initializeSchema(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    try {
      db.close();
      db = null;
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
}
