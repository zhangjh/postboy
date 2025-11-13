import { Database } from 'better-sqlite3';

export function createTables(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS request_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS request_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      method TEXT NOT NULL CHECK(method IN ('GET','POST','PUT','DELETE','OPTIONS','HEAD')),
      url TEXT NOT NULL,
      headers TEXT,
      body TEXT,
      body_type TEXT CHECK(body_type IN ('text','json','xml')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES request_groups(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_request_groups_workspace_id ON request_groups(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_request_items_group_id ON request_items(group_id);
  `);
}

export function initializeSchema(db: Database): void {
  try {
    createTables(db);
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw new Error(`Schema initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
