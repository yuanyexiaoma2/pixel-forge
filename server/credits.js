import db from './db.js';
import { MODEL_CREDITS, ENHANCE_CREDITS, EDIT_CREDITS, DEFAULT_CREDITS } from './config/credits.js';

// 根据 action 类型计算所需积分
function getCost(actionType, model) {
  if (actionType === 'enhance') return ENHANCE_CREDITS;
  if (actionType === 'edit') return EDIT_CREDITS;
  // generate
  return MODEL_CREDITS[model] || DEFAULT_CREDITS;
}

// 积分检查中间件工厂
export function creditsCheck(actionType) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: '未登录' });

    // admin 跳过积分检查
    if (req.user.role === 'admin') {
      req.creditCost = 0;
      return next();
    }

    const model = req.body.model;
    const cost = getCost(actionType, model);
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    if (user.credits < cost) {
      return res.status(403).json({ error: '积分不足', required: cost, current: user.credits });
    }

    req.creditCost = cost;
    next();
  };
}

// 扣减积分 + 写日志
export function deductCredits(userId, cost, action, detail) {
  if (cost <= 0) return;

  db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(cost, userId);
  db.prepare('INSERT INTO credit_logs (user_id, amount, action, detail) VALUES (?, ?, ?, ?)').run(userId, -cost, action, detail || '');
}
