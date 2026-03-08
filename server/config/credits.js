// 各模型每次生成消耗的积分
export const MODEL_CREDITS = {
  'midjourney':        10,
  '4o-image':          8,
  'gpt-image-1.5':     6,
  'flux-2':            6,
  'nano-banana-pro':   4,
  'nano-banana-2':     4,
  'seedream-5.0-lite': 3,
  'seedream-4.5':      3,
  'z-image':           3,
  'grok-imagine':      4,
};

export const ENHANCE_CREDITS = 3;
export const EDIT_CREDITS = 4;

// 视频生成模型积分（基础 / 有声）
export const VIDEO_MODEL_CREDITS = {
  'kling-3.0':        8,
  'kling-2.6':        6,
  'hailuo-2.3':       5,
  'seedance-1.5-pro':      7,
  'sora-2-pro-storyboard': 10,
};
export const VIDEO_SOUND_EXTRA = 2; // 开启声音额外消耗
export const DEFAULT_VIDEO_CREDITS = 6;

// 默认积分（未配置的模型）
export const DEFAULT_CREDITS = 4;
