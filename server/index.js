import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 加载 .env：userData 目录优先（覆盖项目默认），再加载项目根目录兜底
const __server_dir = path.dirname(fileURLToPath(import.meta.url));
if (process.env.PICTUREME_DATA_DIR) {
  dotenv.config({ path: path.join(process.env.PICTUREME_DATA_DIR, '.env'), override: true });
}
dotenv.config({ path: path.join(__server_dir, '..', '.env') });
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

// ─── 用户自定义 API Key ─────────────────────────────────
app.get('/api/apikey', authMiddleware, (req, res) => {
  const key = getUserApiKey(req.user.id);
  // 只返回脱敏后的 key（前4后4）
  const masked = key ? key.slice(0, 4) + '****' + key.slice(-4) : '';
  const hasSystemKey = !!process.env.KIE_API_KEY;
  res.json({ apiKey: masked, hasKey: !!key, hasSystemKey, needKey: !key && !hasSystemKey });
});

app.put('/api/apikey', authMiddleware, (req, res) => {
  const { apiKey } = req.body;
  if (apiKey === undefined) return res.status(400).json({ error: '缺少 apiKey 参数' });
  db.prepare('UPDATE users SET api_key = ? WHERE id = ?').run(apiKey ?? '', req.user.id);
  res.json({ ok: true });
});

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
  const rows = db.prepare("SELECT * FROM images ORDER BY CASE WHEN created_at IS NOT NULL AND created_at != '' THEN created_at ELSE date END DESC, rowid DESC LIMIT 200").all();
  res.json(rows.map(r => ({ ...r, fav: !!r.fav })));
});

// POST /api/images — 保存新生成的图片记录
app.post('/api/images', (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0)
    return res.status(400).json({ error: '无效数据' });

  const ins = db.prepare('INSERT OR REPLACE INTO images (id, prompt, imageUrl, model, ratio, date, color, fav, type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of records) {
    if (!r?.imageUrl) continue;
    ins.run(String(r.id ?? Date.now()), r.prompt ?? '', r.imageUrl, r.model ?? '', r.ratio ?? '', r.date ?? new Date().toISOString().slice(0, 10), r.color ?? '#1a1a20', r.fav ? 1 : 0, r.type ?? 'generate', new Date().toISOString());
  }

  // 保留最新200条
  const count = db.prepare('SELECT COUNT(*) as c FROM images').get().c;
  if (count > 200) {
    db.prepare("DELETE FROM images WHERE id NOT IN (SELECT id FROM images ORDER BY CASE WHEN created_at IS NOT NULL AND created_at != '' THEN created_at ELSE date END DESC, rowid DESC LIMIT 200)").run();
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

// supportsRefImage: 支持参考图
// kieIdImg2Img: 有参考图时切换到图生图模型 ID
// refField: 图生图时参考图的字段名（各模型不同）
const MODEL_CONFIG = {
  'nano-banana-pro':   { type: 'common', kieId: 'nano-banana-pro',              supportsRefImage: true, refField: 'image_input' },
  'nano-banana-2':     { type: 'common', kieId: 'nano-banana-2',                supportsRefImage: true, refField: 'image_input' },
  'nano-banana-edit':  { type: 'common', kieId: 'google/nano-banana-edit' },
  'seedream-5.0-lite': { type: 'common', kieId: 'seedream/5-lite-text-to-image', kieIdImg2Img: 'seedream/5-lite-image-to-image', supportsRefImage: true, refField: 'image_urls' },
  'seedream-4.5':      { type: 'common', kieId: 'seedream/4.5-text-to-image',    kieIdImg2Img: 'seedream/4.5-edit',              supportsRefImage: true, refField: 'image_urls' },
  'gpt-image-1.5':     { type: 'common', kieId: 'gpt-image/1.5-text-to-image',   kieIdImg2Img: 'gpt-image/1.5-image-to-image',   supportsRefImage: true, refField: 'input_urls' },
  'flux-2':            { type: 'common', kieId: 'flux-2/pro-text-to-image'      },
  '4o-image':          { type: '4o',                                              supportsRefImage: true },
  'z-image':           { type: 'common', kieId: 'z-image'                       },
  'midjourney':        { type: 'mj',                                              supportsRefImage: true },
  'grok-imagine':      { type: 'common', kieId: 'grok-imagine/text-to-image',    kieIdImg2Img: 'grok-imagine/image-to-image',    supportsRefImage: true, refField: 'image_urls' },
};

function mapQuality(modelId, quality) {
  if (!quality) return undefined;
  if (modelId === 'gpt-image-1.5' && quality === 'basic') return 'medium';
  return quality;
}

function authHeaders(userApiKey) {
  const key = userApiKey || process.env.KIE_API_KEY;
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

function getUserApiKey(userId) {
  const row = db.prepare('SELECT api_key FROM users WHERE id = ?').get(userId);
  return row?.api_key || '';
}

// 从请求中获取用户自定义 key（若有）
function reqAuthHeaders(req) {
  const userKey = req.user ? getUserApiKey(req.user.id) : '';
  return authHeaders(userKey);
}

// POST /api/upload — 转发到 kie.ai，返回公网可访问的临时 URL（支持多文件）
app.post('/api/upload', authMiddleware, upload.array('file', 10), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: '未收到文件' });
  const apiKey = (req.user ? getUserApiKey(req.user.id) : '') || process.env.KIE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });
  try {
    const urls = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'upload.jpg');
      fd.append('uploadPath', 'images');
      const response = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: fd,
      });
      const json = await response.json();
      console.log('[upload] kie.ai response:', JSON.stringify(json).slice(0, 200));
      const url = json?.data?.downloadUrl;
      if (!url) return res.status(502).json({ error: json?.msg || '文件上传失败' });
      urls.push(url);
    }
    // 兼容旧接口：单文件返回 url，多文件返回 urls 数组
    res.json({ url: urls[0], urls });
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
  const { prompt, model, aspectRatio, resolution, quality, outputFormat, refImageUrl, refImageUrls } = req.body;
  // 兼容旧单张和新多张：统一为数组
  const refUrls = refImageUrls || (refImageUrl ? [refImageUrl] : []);

  console.log(`\n[generate] model=${model} aspectRatio=${aspectRatio} refImages=${refUrls.length}`);
  if (refUrls.length) console.log(`[generate] refImageUrls[0]=${refUrls[0].slice(0, 80)}...`);

  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt 不能为空' });
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  const config = MODEL_CONFIG[model];
  if (!config) return res.status(400).json({ error: `未知模型: ${model}` });

  try {
    let taskId;
    // 解析参考图 URL（本地图片转 base64）
    const resolvedRefs = (await Promise.all(refUrls.map(u => resolveRefImageUrl(u)))).filter(Boolean);
    const resolvedRef = resolvedRefs[0] || null;

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
        method: 'POST', headers: reqAuthHeaders(req), body: JSON.stringify(body),
      });
      const json = await response.json();
      console.log('[generate][mj] kie.ai response:', JSON.stringify(json).slice(0, 300));
      taskId = json?.data?.taskId;
      if (!taskId) return res.status(502).json({ error: json?.msg || '未能获取 taskId' });
      taskId = `task_mj_${taskId}`;
    } else if (config.type === '4o') {
      const body = { prompt, size: aspectRatio || '1:1', nVariants: 1 };
      if (quality === 'high') body.isEnhance = true;
      if (resolvedRefs.length) body.image_input = resolvedRefs;
      console.log('[generate][4o] request body keys:', Object.keys(body));
      const response = await fetch(`${KIE_BASE}/api/v1/gpt4o-image/generate`, {
        method: 'POST', headers: reqAuthHeaders(req), body: JSON.stringify(body),
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
        input.image_input = resolvedRefs.length ? resolvedRefs : [];
      } else if (resolvedRefs.length && config.supportsRefImage) {
        // 各模型图生图字段名不同：image_input / image_urls / input_urls
        const field = config.refField || 'image_input';
        input[field] = resolvedRefs;
      }

      // 有参考图且模型配置了图生图 ID 时，切换到 img2img 端点
      const useKieId = (resolvedRefs.length && config.kieIdImg2Img) ? config.kieIdImg2Img : config.kieId;
      const requestBody = { model: useKieId, input };
      console.log('[generate][common] kieId:', useKieId, resolvedRefs.length ? '(img2img)' : '(txt2img)');
      console.log('[generate][common] input keys:', Object.keys(input));
      if (input.image_input) console.log('[generate][common] image_input[0] prefix:', String(input.image_input[0]).slice(0, 60));

      const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
        method: 'POST', headers: reqAuthHeaders(req),
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
app.get('/api/generate/status/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  try {
    if (taskId.startsWith('task_mj_')) {
      const realId = taskId.slice(8);
      const response = await fetch(
        `${KIE_BASE}/api/v1/mj/record-info?taskId=${encodeURIComponent(realId)}`,
        { headers: reqAuthHeaders(req) },
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
        { headers: reqAuthHeaders(req) },
      );
      const json = await response.json();
      const data = json?.data;
      if (data?.successFlag === 1) return res.json({ status: 'success', images: data?.response?.resultUrls ?? [] });
      if (data?.successFlag === 2 || data?.successFlag === 3) return res.json({ status: 'failed', error: '图像生成失败' });
      return res.json({ status: 'generating', progress: data?.progress ?? 0 });
    }

    const response = await fetch(
      `${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: reqAuthHeaders(req) },
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
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  try {
    const input = {
      prompt: prompt || '',
      image_urls: [imageUrl],
      output_format: outputFormat || 'png',
      image_size: imageSize || '1:1',
    };
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
      method: 'POST', headers: reqAuthHeaders(req),
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
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  try {
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
      method: 'POST', headers: reqAuthHeaders(req),
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
app.get('/api/enhance/status/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });
  try {
    const response = await fetch(`${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: reqAuthHeaders(req) });
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

// ─── 视频生成 ───────────────────────────────────────────

const VIDEO_MODEL_CONFIG = {
  'kling-3.0':        { text2video: 'kling-3.0/video',             img2video: 'kling-3.0/video' },
  'kling-2.6':        { text2video: 'kling-2.6/text-to-video',     img2video: 'kling-2.6/image-to-video' },
  'hailuo-2.3':       { text2video: null,                           img2video: 'hailuo/2-3-image-to-video-pro' },
  'seedance-1.5-pro':      { text2video: 'bytedance/seedance-1.5-pro',  img2video: 'bytedance/seedance-1.5-pro' },
  'sora-2-pro-storyboard': { text2video: 'openai/sora-2-pro-storyboard', img2video: 'openai/sora-2-pro-storyboard' },
};

// POST /api/video/generate
app.post('/api/video/generate', creditsCheck('video'), async (req, res) => {
  const { prompt, model, mode, aspectRatio, duration, refImageUrl, sound, qualityMode, resolution, fixedLens } = req.body;

  console.log(`\n[video] model=${model} mode=${mode} aspectRatio=${aspectRatio} duration=${duration} sound=${sound} qualityMode=${qualityMode} resolution=${resolution}`);

  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt 不能为空' });
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  const config = VIDEO_MODEL_CONFIG[model];
  if (!config) return res.status(400).json({ error: `未知视频模型: ${model}` });

  const isImg2Video = mode === 'img2video' && refImageUrl;
  const kieModelId = isImg2Video ? config.img2video : config.text2video;

  if (!kieModelId) return res.status(400).json({ error: `${model} 不支持${isImg2Video ? '图生视频' : '文生视频'}模式` });

  try {
    const resolvedRef = isImg2Video ? await resolveRefImageUrl(refImageUrl) : null;
    const input = { prompt };
    if (aspectRatio) input.aspect_ratio = aspectRatio;
    if (duration) input.duration = String(duration);

    if (model === 'kling-3.0') {
      // Kling 3.0: 统一模型 ID，用 image_urls 传参考图
      input.sound = !!sound;
      input.mode = qualityMode || 'pro';
      input.multi_shots = false;
      input.multi_prompt = [];
      if (resolvedRef) input.image_urls = [resolvedRef];
    } else if (model === 'kling-2.6') {
      // Kling 2.6: sound 必填
      input.sound = !!sound;
      if (resolvedRef) input.image_urls = [resolvedRef];
    } else if (model === 'hailuo-2.3') {
      // Hailuo 2.3: 用 image_url (单数) 而非 image_urls
      if (resolution) input.resolution = resolution;
      if (resolvedRef) input.image_url = resolvedRef;
    } else if (model === 'seedance-1.5-pro') {
      // Seedance 1.5 Pro: input_urls 传参考图，支持 fixed_lens 和 generate_audio
      input.generate_audio = !!sound;
      input.fixed_lens = !!fixedLens;
      if (resolution) input.resolution = resolution;
      if (resolvedRef) input.input_urls = [resolvedRef];
    } else if (model === 'sora-2-pro-storyboard') {
      // Sora 2 Pro Storyboard: input_urls 传参考图
      if (resolvedRef) input.input_urls = [resolvedRef];
    }

    const requestBody = { model: kieModelId, input };
    console.log('[video] kieModelId:', kieModelId, 'input keys:', Object.keys(input));

    const response = await fetch(`${KIE_BASE}/api/v1/jobs/createTask`, {
      method: 'POST', headers: reqAuthHeaders(req),
      body: JSON.stringify(requestBody),
    });
    const json = await response.json();
    console.log('[video] kie.ai response:', JSON.stringify(json).slice(0, 300));
    const taskId = json?.data?.taskId;
    if (!taskId) return res.status(502).json({ error: json?.msg || '未能获取 taskId' });

    if (req.creditCost > 0) deductCredits(req.user.id, req.creditCost, 'video', `model=${model}`);
    res.json({ taskId });
  } catch (err) {
    console.error('[video] 异常:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// GET /api/video/status/:taskId
app.get('/api/video/status/:taskId', authMiddleware, async (req, res) => {
  const { taskId } = req.params;
  if (!process.env.KIE_API_KEY && !(req.user && getUserApiKey(req.user.id))) return res.status(500).json({ error: 'API Key 未配置，请在侧边栏设置自定义 API Key' });

  try {
    const response = await fetch(
      `${KIE_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: reqAuthHeaders(req) },
    );
    const json = await response.json();
    const data = json?.data;
    if (data?.state === 'success') {
      let resultJson = {}; try { resultJson = JSON.parse(data.resultJson ?? '{}'); } catch {};
      const videoUrls = resultJson.resultUrls ?? [];
      return res.json({ status: 'success', videos: videoUrls });
    }
    if (data?.state === 'fail') {
      console.error(`[video-status] task=${taskId} FAILED: ${data?.failMsg}`);
      return res.json({ status: 'failed', error: data?.failMsg || '视频生成失败' });
    }
    return res.json({ status: 'generating', progress: data?.progress ?? 0 });
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
