// Cloudflare D1 Database Helper Interface

export interface Env {
  DB: D1Database;
}

export async function queryAll<T = any>(db: D1Database, query: string, params: any[] = []): Promise<T[]> {
  try {
    const stmt = db.prepare(query);
    const bindStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await bindStmt.all<T>();
    return results || [];
  } catch (error) {
    console.error('D1 Query Error:', error, query, params);
    throw error;
  }
}

export async function queryFirst<T = any>(db: D1Database, query: string, params: any[] = []): Promise<T | null> {
  try {
    const stmt = db.prepare(query);
    const bindStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bindStmt.first<T>();
    return result || null;
  } catch (error) {
    console.error('D1 Query First Error:', error, query, params);
    throw error;
  }
}

export async function executeRun(db: D1Database, query: string, params: any[] = []) {
  try {
    const stmt = db.prepare(query);
    const bindStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    return await bindStmt.run();
  } catch (error) {
    console.error('D1 Execute Error:', error, query, params);
    throw error;
  }
}
