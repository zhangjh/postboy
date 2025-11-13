import { getDatabase } from './connection.js';

export interface RequestGroup {
  id: number;
  workspaceId: number;
  name: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

interface RequestGroupRow {
  id: number;
  workspace_id: number;
  name: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

function rowToRequestGroup(row: RequestGroupRow): RequestGroup {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getGroups(workspaceId: number): RequestGroup[] {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM request_groups WHERE workspace_id = ? ORDER BY sort_order ASC, created_at ASC'
  );
  const rows = stmt.all(workspaceId) as RequestGroupRow[];
  return rows.map(rowToRequestGroup);
}

export function getGroupById(id: number): RequestGroup | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM request_groups WHERE id = ?');
  const row = stmt.get(id) as RequestGroupRow | undefined;
  return row ? rowToRequestGroup(row) : null;
}

export function createGroup(workspaceId: number, name: string, sortOrder?: number): RequestGroup {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    let order = sortOrder;
    if (order === undefined) {
      const maxOrderStmt = db.prepare(
        'SELECT MAX(sort_order) as max_order FROM request_groups WHERE workspace_id = ?'
      );
      const result = maxOrderStmt.get(workspaceId) as { max_order: number | null };
      order = (result.max_order ?? -1) + 1;
    }
    
    const stmt = db.prepare(
      'INSERT INTO request_groups (workspace_id, name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    );
    const insertResult = stmt.run(workspaceId, name, order, now, now);
    
    const group = getGroupById(insertResult.lastInsertRowid as number);
    if (!group) {
      throw new Error('Failed to retrieve created request group');
    }
    return group;
  });
  
  return transaction();
}

export function updateGroup(id: number, name: string, sortOrder?: number): void {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    if (sortOrder !== undefined) {
      const stmt = db.prepare(
        'UPDATE request_groups SET name = ?, sort_order = ?, updated_at = ? WHERE id = ?'
      );
      const result = stmt.run(name, sortOrder, now, id);
      
      if (result.changes === 0) {
        throw new Error(`Request group with id ${id} not found`);
      }
    } else {
      const stmt = db.prepare(
        'UPDATE request_groups SET name = ?, updated_at = ? WHERE id = ?'
      );
      const result = stmt.run(name, now, id);
      
      if (result.changes === 0) {
        throw new Error(`Request group with id ${id} not found`);
      }
    }
  });
  
  transaction();
}

export function deleteGroup(id: number): void {
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare('DELETE FROM request_groups WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Request group with id ${id} not found`);
    }
  });
  
  transaction();
}
