import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.PICTUREME_DATA_DIR
  ? path.join(process.env.PICTUREME_DATA_DIR, 'data')
  : path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'pixel-forge.db');

// 初始化 sql.js 并加载/创建数据库
const SQL = await initSqlJs();
const raw = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();

// 写入磁盘（防抖：合并短时间内的多次写入）
let persistTimer = null;
function persist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 100);
}
function persistNow() {
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
  const data = raw.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}
// 进程退出前确保写入
process.on('exit', persistNow);
process.on('SIGINT', () => { persistNow(); process.exit(); });
process.on('SIGTERM', () => { persistNow(); process.exit(); });

// 兼容 better-sqlite3 API 的包装层
const db = {
  exec(sql) {
    raw.run(sql);
    persist();
  },
  prepare(sql) {
    return {
      get(...params) {
        const stmt = raw.prepare(sql);
        stmt.bind(params);
        if (!stmt.step()) { stmt.free(); return undefined; }
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        stmt.free();
        const row = {};
        for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
        return row;
      },
      all(...params) {
        const stmt = raw.prepare(sql);
        stmt.bind(params);
        const cols = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) {
          const vals = stmt.get();
          const row = {};
          for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
          rows.push(row);
        }
        stmt.free();
        return rows;
      },
      run(...params) {
        raw.run(sql, params);
        persist();
        // 兼容 better-sqlite3 的返回值
        const lastInsertRowid = raw.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0];
        return { lastInsertRowid };
      },
    };
  },
};

// 建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    credits INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS credit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL DEFAULT '',
    imageUrl TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT '',
    ratio TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT (date('now')),
    color TEXT NOT NULL DEFAULT '#1a1a20',
    fav INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed admin 账号（仅当 users 表为空时）
const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (count === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role, credits) VALUES (?, ?, ?, ?)').run('admin', hash, 'admin', 99999);
  console.log('[db] admin 账号已创建 (admin/admin123)');
}

export default db;
