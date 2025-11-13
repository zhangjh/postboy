import { getDatabase } from './connection.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';
export type BodyType = 'text' | 'json' | 'xml';

export interface RequestItem {
  id: number;
  groupId: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  bodyType?: BodyType;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

interface RequestItemRow {
  id: number;
  group_id: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers: string | null;
  body: string | null;
  body_type: BodyType | null;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface CreateRequestItemData {
  groupId: number;
  name: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: BodyType;
  sortOrder?: number;
}

export interface UpdateRequestItemData {
  name?: string;
  method?: HttpMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  bodyType?: BodyType;
  sortOrder?: number;
}

function rowToRequestItem(row: RequestItemRow): RequestItem {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    method: row.method,
    url: row.url,
    headers: row.headers ? JSON.parse(row.headers) : {},
    body: row.body ?? undefined,
    bodyType: row.body_type ?? undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getRequests(groupId: number): RequestItem[] {
  const db = getDatabase();
  const stmt = db.prepare(
    'SELECT * FROM request_items WHERE group_id = ? ORDER BY sort_order ASC, created_at ASC'
  );
  const rows = stmt.all(groupId) as RequestItemRow[];
  return rows.map(rowToRequestItem);
}

export function getRequestById(id: number): RequestItem | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM request_items WHERE id = ?');
  const row = stmt.get(id) as RequestItemRow | undefined;
  return row ? rowToRequestItem(row) : null;
}

export function createRequest(data: CreateRequestItemData): RequestItem {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    let order = data.sortOrder;
    if (order === undefined) {
      const maxOrderStmt = db.prepare(
        'SELECT MAX(sort_order) as max_order FROM request_items WHERE group_id = ?'
      );
      const result = maxOrderStmt.get(data.groupId) as { max_order: number | null };
      order = (result.max_order ?? -1) + 1;
    }
    
    const headersJson = data.headers ? JSON.stringify(data.headers) : null;
    
    const stmt = db.prepare(`
      INSERT INTO request_items 
      (group_id, name, method, url, headers, body, body_type, sort_order, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertResult = stmt.run(
      data.groupId,
      data.name,
      data.method,
      data.url,
      headersJson,
      data.body ?? null,
      data.bodyType ?? null,
      order,
      now,
      now
    );
    
    const request = getRequestById(insertResult.lastInsertRowid as number);
    if (!request) {
      throw new Error('Failed to retrieve created request item');
    }
    return request;
  });
  
  return transaction();
}

export function updateRequest(id: number, data: UpdateRequestItemData): void {
  const db = getDatabase();
  const now = Date.now();
  
  const transaction = db.transaction(() => {
    const current = getRequestById(id);
    if (!current) {
      throw new Error(`Request item with id ${id} not found`);
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.method !== undefined) {
      updates.push('method = ?');
      values.push(data.method);
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      values.push(data.url);
    }
    if (data.headers !== undefined) {
      updates.push('headers = ?');
      values.push(JSON.stringify(data.headers));
    }
    if (data.body !== undefined) {
      updates.push('body = ?');
      values.push(data.body);
    }
    if (data.bodyType !== undefined) {
      updates.push('body_type = ?');
      values.push(data.bodyType);
    }
    if (data.sortOrder !== undefined) {
      updates.push('sort_order = ?');
      values.push(data.sortOrder);
    }
    
    if (updates.length === 0) {
      return;
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const sql = `UPDATE request_items SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values);
  });
  
  transaction();
}

export function deleteRequest(id: number): void {
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    const stmt = db.prepare('DELETE FROM request_items WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      throw new Error(`Request item with id ${id} not found`);
    }
  });
  
  transaction();
}
