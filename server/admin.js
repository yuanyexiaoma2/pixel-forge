import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from './db.js';

const router = Router();

// requireAdmin 中间件
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: '需要管理员权限' });
  next();
}

router.use(requireAdmin);

// GET /api/admin/users — 用户列表
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, username, role, credits, created_at FROM users ORDER BY id').all();
  res.json({ users });
});

// POST /api/admin/create-user — 创建用户
router.post('/create-user', (req, res) => {
  const { username, password, role, credits } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.status(409).json({ error: '用户名已存在' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password, role, credits) VALUES (?, ?, ?, ?)').run(
    username, hash, role || 'user', credits ?? 100
  );
  const user = db.prepare('SELECT id, username, role, credits, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.json({ user });
});

// POST /api/admin/recharge — 充值积分
router.post('/recharge', (req, res) => {
  const { userId, amount } = req.body;
  if (!userId || !amount || amount <= 0) return res.status(400).json({ error: '参数无效' });

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, userId);
  db.prepare('INSERT INTO credit_logs (user_id, amount, action, detail) VALUES (?, ?, ?, ?)').run(userId, amount, 'recharge', `管理员充值 ${amount} 积分`);

  const updated = db.prepare('SELECT id, username, role, credits FROM users WHERE id = ?').get(userId);
  res.json({ user: updated });
});

// POST /api/admin/update-user — 修改用户名/密码
router.post('/update-user', (req, res) => {
  const { userId, username, password } = req.body;
  if (!userId) return res.status(400).json({ error: '缺少 userId' });

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  if (username) {
    const exists = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
    if (exists) return res.status(409).json({ error: '用户名已存在' });
    db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);
  }

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, userId);
  }

  const updated = db.prepare('SELECT id, username, role, credits, created_at FROM users WHERE id = ?').get(userId);
  res.json({ user: updated });
});

// DELETE /api/admin/users/:id — 删除用户
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  // 不允许删除自己
  if (Number(id) === req.user.id) return res.status(400).json({ error: '不能删除自己' });

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  db.prepare('DELETE FROM credit_logs WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
