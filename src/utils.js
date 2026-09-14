export const fmtMoney = (n) => `¥${Number(n).toFixed(Number(n) % 1 ? 2 : 0)}`;

export const fmtDate = (d) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
};

export const dateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const isToday = (d) => dateStr() === d;

export const AVATARS = ['🦊', '🐻', '🐰', '🐼', '🐸', '🐱', '🐶', '🐹', '🦉', '🐨', '🦁', '🐵'];

export const CATEGORIES = ['房租', '水电', '网费', '日用', '餐饮', '其他'];

export const AREAS = ['厨房', '卫生间', '客厅', '倒垃圾', '阳台'];
