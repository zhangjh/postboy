import { getDatabase } from './connection.js';

export interface Workspace {
  id: number;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceRow {
  id: number;
  name: string;
  created_at: number;
  updated_at: number;
}

function rowToWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getWorkspaces(): Workspace[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC');
  const rows = stmt.all() as WorkspaceRow[];
  return rows.map(rowToWorkspace);
}

export function getWorkspaceById(id: number): Workspace | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM workspaces WHERE id = ?');
  const row = stmt.get(id) as WorkspaceRow | undefined;
  return row ? rowToWorkspace(row) : null;
}

export function createWorkspace(name: string): Workspace {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare(
      'INSERT INTO workspaces (name, created_at, updated_at) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, now, now);
    
    const workspace = getWorkspaceById(result.lastInsertRowid as number);
    if (!workspace) {
      throw new Error('Failed to retrieve created workspace');
    }
    return workspace;
  });
  
  return transaction();
}

export function updateWorkspace(id: number, name: string): void {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare(
      'UPDATE workspaces SET name = ?, updated_at = ? WHERE id = ?'
    );
    const result = stmt.run(name, now, id);
    
    if (result.changes === 0) {
      throw new Error(`Workspace with id ${id} not found`);
    }
  });
  
  transaction();
}

export function deleteWorkspace(id: number): void {
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare('DELETE FROM workspaces WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Workspace with id ${id} not found`);
    }
  });
  
  transaction();
}
