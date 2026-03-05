import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载 .env：优先项目根目录，打包后也尝试 userData 目录
const __server_dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__server_dir, '..', '.env') });
if (process.env.PICTUREME_DATA_DIR) {
  dotenv.config({ path: path.join(process.env.PICTUREME_DATA_DIR, '.env') });
}
import db from './db.js';
import authRouter, { authMiddleware } from './auth.js';
import adminRouter from './admin.js';
import { creditsCheck, deductCredits } from './credits.js';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 打包后用 PICTUREME_DATA_DIR，否则用项目目录
const uploadsDir = process.env.PICTUREME_DATA_DIR
  ? path.join(process.env.PICTUREME_DATA_DIR, 'uploads')
  : path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// ─── 认证路由（login 不需要 JWT） ──────────────────────────
app.use('/api/auth', authRouter);

// ─── 全局 JWT 中间件（排除 /api/auth/login） ────────────────
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth/')) return next();
  authMiddleware(req, res, next);
});

// ─── 管理员路由 ─────────────────────────────────────────────
app.use('/api/admin', adminRouter);

// ─── Images 持久化（SQLite） ──────────────────────────────

// 自动迁移：如果旧 JSON 文件存在，导入到 SQLite 后删除
const dataDir = path.join(__dirname, 'data');
const imagesFile = path.join(dataDir, 'images.json');
if (fs.existsSync(imagesFile)) {
  try {
    const old = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
    const ins = db.prepare('INSERT OR IGNORE INTO images (id, prompt, imageUrl, model, ratio, date, color, fav) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of old) {
      if (!r?.imageUrl) continue;
      ins.run(String(r.id ?? Date.now()), r.prompt ?? '', r.imageUrl, r.model ?? '', r.ratio ?? '', r.date ?? new Date().toISOString().slice(0, 10), r.color ?? '#1a1a20', r.fav ? 1 : 0);
    }
    fs.renameSync(imagesFile, imagesFile + '.bak');
    console.log(`[migrate] 已将 ${old.length} 条图片记录迁移到 SQLite`);
  } catch (e) { console.error('[migrate] 迁移失败:', e.message); }
}

// GET /api/images — 返回全部（最多200条，倒序）
app.get('/api/images', (req, res) => {
  const rows = db.prepare('SELECT * FROM images ORDER BY id DESC LIMIT 200').all();
  res.json(rows.map(r => ({ ...r, fav: !!r.fav })));
});

// POST /api/images — 保存新生成的图片记录
app.post('/api/images', (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0)
    return res.status(400).json({ error: '无效数据' });

  const ins = db.prepare('INSERT OR REPLACE INTO images (id, prompt, imageUrl, model, ratio, date, color, fav) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of records) {
    if (!r?.imageUrl) continue;
    ins.run(String(r.id ?? Date.now()), r.prompt ?? '', r.imageUrl, r.model ?? '', r.ratio ?? '', r.date ?? new Date().toISOString().slice(0, 10), r.color ?? '#1a1a20', r.fav ? 1 : 0);
  }

  // 保留最新200条
  const count = db.prepare('SELECT COUNT(*) as c FROM images').get().c;
  if (count > 200) {
    db.prepare('DELETE FROM images WHERE id NOT IN (SELECT id FROM images ORDER BY id DESC LIMIT 200)').run();
  }
  res.json({ ok: true });
});

// PATCH /api/images/:id — 更新记录字段（收藏等）
app.patch('/api/images/:id', (req, res) => {
  const { id } = req.params;
  const ALLOWED = ['fav', 'prompt', 'model', 'ratio', 'color'];
  const sets = [];
  const vals = [];
  for (const k of ALLOWED) {
    if (k in req.body) {
      sets.push(`${k} = ?`);
      vals.push(k === 'fav' ? (req.body[k] ? 1 : 0) : req.body[k]);
    }
  }
  if (sets.length === 0) return res.json({ ok: true });
  vals.push(id);
  const existing = db.prepare('SELECT id FROM images WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: '记录不存在' });
  db.prepare(`UPDATE images SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  res.json({ ok: true });
});

// DELETE /api/images/:id — 删除记录
app.delete('/api/images/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM images WHERE id = ?').run(id);
  res.json({ ok: true });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const KIE_BASE = 'https://api.kie.ai';

// supportsRefImage: 支持参考图时在 input 里统一用 image_input: [url] 数组
const MODEL_CONFIG = {
  'nano-banana-pro':   { type: 'common', kieId: 'nano-banana-pro',              supportsRefImage: true },
  'nano-banana-2':     { type: 'common', kieId: 'nano-banana-2',                supportsRefImage: true },
  'nano-banana-edit':  { type: 'common', kieId: 'google/nano-banana-edit' },
  'seedream-5.0-lite': { type: 'common', kieId: 'seedream/5-lite-text-to-image', supportsRefImage: true },
  'seedream-4.5':      { type: 'common', kieId: 'seedream/4.5-text-to-image',    supportsRefImage: true },
  'gpt-image-1.5':     { type: 'common', kieId: 'gpt-image/1.5-text-to-image',   supportsRefImage: true },
  'flux-2':            { type: 'common', kieId: 'flux-2/pro-text-to-image'      },
  '4o-image':          { type: '4o',                                              supportsRefImage: true },
  'z-image':           { type: 'common', kieId: 'z-image'                       },
  'midjourney':        { type: 'mj',                                              supportsRefImage: true },
  'grok-imagine':      { type: 'common', kieId: 'grok-imagine/text-to-image',    supportsRefImage: true },
};

function mapQuality(modelId, quality) {
  if (!quality) return undefined;
  if (modelId === 'gpt-image-1.5' && quality === 'basic') return 'medium';
  return quality;
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

// POST /api/upload — 转发到 kie.ai，返回公网可访问的临时 URL
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到文件' });
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });
  try {
    const fd = new FormData();
    fd.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname || 'upload.jpg');
    fd.append('uploadPath', 'images');
    const response = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
      body: fd,
    });
    const json = await response.json();
    console.log('[upload] kie.ai response:', JSON.stringify(json).slice(0, 200));
    const url = json?.data?.downloadUrl;
    if (!url) return res.status(502).json({ error: json?.msg || '文件上传失败' });
    res.json({ url });
  } catch (err) {
    console.error('[upload] 异常:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// 将本地 localhost URL 转为 base64 data URL，供 kie.ai 服务器访问
async function resolveRefImageUrl(url) {
  if (!url) return null;
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  if (!isLocal) return url;

  try {
    const filename = path.basename(url.split('/uploads/').pop());
    const filePath = path.join(uploadsDir, filename);
    if (!filePath.startsWith(uploadsDir)) return url;
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mime = { png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext] || 'image/jpeg';
    const b64 = `data:${mime};base64,${buffer.toString('base64')}`;
    console.log(`[ref-image] localhost URL → base64 (${Math.round(buffer.length / 1024)}KB)`);
    return b64;
  } catch (e) {
    console.error('[ref-image] 读取本地文件失败:', e.message);
    return url; // 降级：仍用原始 URL
  }
}

// POST /api/generate
app.post('/api/generate', creditsCheck('generate'), async (req, res) => {
  const { prompt, model, aspectRatio, resolution, quality, outputFormat, refImageUrl } = req.body;

  console.log(`\n[generate] model=${model} aspectRatio=${aspectRatio} hasRefImage=${!!refImageUrl}`);
  if (refImageUrl) console.log(`[generate] refImageUrl=${refImageUrl.slice(0, 80)}...`);

  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt 不能为空' });
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });

  const config = MODEL_CONFIG[model];
  if (!config) return res.status(400).json({ error: `未知模型: ${model}` });

  try {
    let taskId;
    // 解析参考图 URL（本地图片转 base64）
    const resolvedRef = await resolveRefImageUrl(refImageUrl);

    if (config.type === 'mj') {
      const body = {
        prompt,
        taskType: 'mj_txt2img',
        speed: req.body.speed || 'fast',
        aspectRatio: aspectRatio || '1:1',
      };
      if (resolvedRef) { body.taskType = 'mj_img2img'; body.fileUrl = resolvedRef; }
      console.log('[generate][mj] request body:', JSON.stringify(body).slice(0, 300));
      const response = await fetch(`${KIE_BASE}/api/v1/mj/generate`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
      });
      const json = await response.json();
      console.log('[generate][mj] kie.ai response:', JSON.stringify(json).slice(0, 300));
      taskId = json?.data?.taskId;
      if (!taskId) return res.status(502).json({ error: json?.msg || '未能获取 taskId' });
      taskId = `task_mj_${taskId}`;
    } else if (config.type === '4o') {
      const body = { prompt, size: aspectRatio || '1:1', nVariants: 1 };
      if (quality === 'high') body.isEnhance = true;
      if (resolvedRef) body.image_input = [resolvedRef];
      console.log('[generate][4o] request body keys:', Object.keys(body));
      const response = await fetch(`${KIE_BASE}/api/v1/gpt4o-image/generate`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
      });
      const json = await response.json();
      console.log('[generate][4o] kie.ai response:', JSON.stringify(json).slice(0, 300));
      taskId = json?.data?.taskId;
      if (!taskId) return res.status(502).json({ error: json?.msg || '未能获取 taskId' });
    } else {
      const input = {
        prompt,
        aspect_ratio: aspectRatio || '1:1',
      };
      if (resolution)   input.resolution    = resolution;
      if (quality)      input.quality       = mapQuality(model, quality);
      if (outputFormat) input.output_format = outputFormat;

      // nano-banana 系列 API 要求必须带 image_input 字段（无参考图时传空数组）
      if (model === 'nano-banana-pro' || model === 'nano-banana-2') {
        input.image_input = resolvedRef ? [resolvedRef] : [];
      } else if (resolvedRef && config.supportsRefImage) {
        input.image_input = [resolvedRef];
      }

      const requestBody = { model: config.kieId, input };
      console.log('[generate][common] kieId:', config.kieId);
      console.log('[generate][common] input keys:', Object.keys(input));
      if (input.image_input) console.log('[generate][common] image_input[0] prefix:', String(input.image_input[0]).slice(0, 60));

      const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(requestBody),
      });
      const json = await response.json();
      console.log('[generate][common] kie.ai response:', JSON.stringify(json).slice(0, 300));
      taskId = json?.data?.taskId;
      if (!taskId) return res.status(502).json({ error: json?.msg || '未能获取 taskId' });
    }

    console.log('[generate] taskId:', taskId);
    // 成功创建任务后扣减积分
    if (req.creditCost > 0) deductCredits(req.user.id, req.creditCost, 'generate', `model=${model}`);
    res.json({ taskId });
  } catch (err) {
    console.error('[generate] 异常:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// GET /api/generate/status/:taskId
app.get('/api/generate/status/:taskId', async (req, res) => {
  const { taskId } = req.params;
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });

  try {
    if (taskId.startsWith('task_mj_')) {
      const realId = taskId.slice(8);
      const response = await fetch(
        `${KIE_BASE}/api/v1/mj/record-info?taskId=${encodeURIComponent(realId)}`,
        { headers: authHeaders() },
      );
      const json = await response.json();
      const data = json?.data;
      if (data?.successFlag === 1) {
        const urls = (data?.resultInfoJson?.resultUrls ?? []).map(r => r.resultUrl).filter(Boolean);
        return res.json({ status: 'success', images: urls });
      }
      if (data?.successFlag === 2 || data?.successFlag === 3) return res.json({ status: 'failed', error: data?.errorMessage || '图像生成失败' });
      return res.json({ status: 'generating', progress: 0 });
    }

    if (taskId.startsWith('task_4o')) {
      const response = await fetch(
        `${KIE_BASE}/api/v1/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`,
        { headers: authHeaders() },
      );
      const json = await response.json();
      const data = json?.data;
      if (data?.successFlag === 1) return res.json({ status: 'success', images: data?.response?.resultUrls ?? [] });
      if (data?.successFlag === 2 || data?.successFlag === 3) return res.json({ status: 'failed', error: '图像生成失败' });
      return res.json({ status: 'generating', progress: data?.progress ?? 0 });
    }

    const response = await fetch(
      `${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: authHeaders() },
    );
    const json = await response.json();
    const data = json?.data;
    if (data?.state === 'success') {
      let resultJson = {}; try { resultJson = JSON.parse(data.resultJson ?? '{}'); } catch {};
      return res.json({ status: 'success', images: resultJson.resultUrls ?? [] });
    }
    if (data?.state === 'fail') {
      const failMsg = data?.failMsg || '图像生成失败';
      console.error(`[status] task=${taskId} FAILED: ${failMsg}`);
      console.error('[status] full data:', JSON.stringify(data).slice(0, 500));
      return res.json({ status: 'failed', error: failMsg });
    }
    return res.json({ status: 'generating', progress: data?.progress ?? 0 });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /api/edit — 调用 Nano Banana Edit 进行图片编辑
app.post('/api/edit', creditsCheck('edit'), async (req, res) => {
  const { prompt, imageUrl, outputFormat, imageSize } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl 必填' });
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });

  try {
    const input = {
      prompt: prompt || '',
      image_urls: [imageUrl],
      output_format: outputFormat || 'png',
      image_size: imageSize || '1:1',
    };
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ model: 'google/nano-banana-edit', input }),
    });
    const json = await response.json();
    const taskId = json?.data?.taskId;
    if (!taskId) return res.status(502).json({ error: json?.msg || '创建任务失败' });
    if (req.creditCost > 0) deductCredits(req.user.id, req.creditCost, 'edit', 'nano-banana-edit');
    res.json({ taskId });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /api/enhance
app.post('/api/enhance', creditsCheck('enhance'), async (req, res) => {
  const { imageUrl, upscaleFactor } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl 必填' });
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });

  try {
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ model: 'topaz/image-upscale', input: { image_url: imageUrl, upscale_factor: upscaleFactor || '2' } }),
    });
    const json = await response.json();
    const taskId = json?.data?.taskId;
    if (!taskId) return res.status(502).json({ error: json?.msg || '创建任务失败' });
    if (req.creditCost > 0) deductCredits(req.user.id, req.creditCost, 'enhance', `upscale_${upscaleFactor || '2'}x`);
    res.json({ taskId });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/enhance/status/:taskId
app.get('/api/enhance/status/:taskId', async (req, res) => {
  const { taskId } = req.params;
  if (!process.env.KIE_API_KEY) return res.status(500).json({ error: 'KIE_API_KEY 未配置' });
  try {
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: authHeaders() });
    const json = await response.json();
    const data = json?.data;
    if (data?.state === 'success') {
      let resultJson = {}; try { resultJson = JSON.parse(data.resultJson ?? '{}'); } catch {};
      return res.json({ status: 'success', images: resultJson.resultUrls ?? [] });
    }
    if (data?.state === 'fail') return res.json({ status: 'failed', error: data?.failMsg || '增强失败' });
    return res.json({ status: 'processing', progress: data?.progress ?? 0 });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/download
const ALLOWED_DOWNLOAD_HOSTS = ['tempfile.aiquickdraw.com', 'kieai.redpandaai.co', 'api.kie.ai'];
app.get('/api/download', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url 参数必填' });
  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOWNLOAD_HOSTS.includes(parsed.hostname))
      return res.status(403).json({ error: '不允许下载该域名的资源' });
    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: '图片获取失败' });
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="pictureme.${ext}"`);
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// Production: serve Vite build output as static files
if (process.env.STATIC_DIR) {
  app.use(express.static(process.env.STATIC_DIR));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(process.env.STATIC_DIR, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`后端服务运行于 http://localhost:${PORT}`));

export { app, server };
