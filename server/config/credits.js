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

// 默认积分（未配置的模型）
export const DEFAULT_CREDITS = 4;
