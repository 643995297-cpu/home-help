import express from 'express';
import cors from 'cors';
import {
  findHouse, findHouseByCode, createHouse, joinHouse,
  persist, logActivity, settlementOf, uid,
} from './store.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const houseOr404 = (req, res) => {
  const house = findHouse(req.params.id);
  if (!house) {
    res.status(404).json({ error: '房屋不存在' });
    return null;
  }
  return house;
};
const roommateOf = (house, rid) => house.roommates.find((r) => r.id === rid);

/* ---------- 健康检查 ---------- */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* ---------- 房屋 ---------- */
// 房屋完整数据（含结算）
app.get('/api/houses/:id', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  res.json({ ...house, settlement: settlementOf(house) });
});

// 创建房屋（房主）
app.post('/api/houses', (req, res) => {
  const { name, ownerName, avatar, room } = req.body || {};
  const house = createHouse({ name, ownerName, avatar, room });
  res.status(201).json(house);
});

// 凭邀请码加入房屋
app.post('/api/houses/join', (req, res) => {
  const { code, name, avatar, room } = req.body || {};
  const house = findHouseByCode(code || '');
  if (!house) return res.status(404).json({ error: '邀请码无效' });
  const roommate = joinHouse(house, { name, avatar, room });
  res.status(201).json({ houseId: house.id, roommate });
});

/* ---------- 室友 ---------- */
app.post('/api/houses/:id/roommates', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const roommate = joinHouse(house, req.body || {});
  logActivity(house, { type: 'roommate', icon: '👋', text: `${roommate.name} 入住了 ${roommate.room}` });
  persist();
  res.status(201).json(roommate);
});

/* ---------- 费用 ---------- */
app.post('/api/houses/:id/expenses', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const { amount, category, payerId, date, note, splitAmong } = req.body || {};
  if (!amount || amount <= 0) return res.status(400).json({ error: '金额无效' });
  if (!Array.isArray(splitAmong) || splitAmong.length === 0) return res.status(400).json({ error: '请选择分摊对象' });
  const expense = {
    id: uid(), amount: Number(amount), category: category || '其他',
    payerId, date: date || new Date().toISOString().slice(0, 10),
    note: note || '', splitAmong,
  };
  house.expenses.push(expense);
  const payer = roommateOf(house, payerId);
  logActivity(house, { type: 'expense', icon: '💰', text: `${payer?.name || '?'} 记了一笔 ${expense.category} ¥${expense.amount}` });
  persist();
  res.status(201).json(expense);
});

app.delete('/api/houses/:id/expenses/:eid', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  house.expenses = house.expenses.filter((e) => e.id !== req.params.eid);
  persist();
  res.json({ ok: true });
});

/* ---------- 清洁任务 ---------- */
app.post('/api/houses/:id/tasks', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const { area, date, assigneeId } = req.body || {};
  if (!date) return res.status(400).json({ error: '请选择日期' });
  const task = { id: uid(), area: area || '公共区域', date, assigneeId, done: false, doneAt: '' };
  house.tasks.push(task);
  persist();
  res.status(201).json(task);
});

// 打卡/取消打卡
app.patch('/api/houses/:id/tasks/:tid', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const task = house.tasks.find((t) => t.id === req.params.tid);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  task.done = !task.done;
  task.doneAt = task.done ? new Date().toISOString().slice(0, 10) : '';
  if (task.done) {
    const r = roommateOf(house, task.assigneeId);
    logActivity(house, { type: 'task', icon: '✅', text: `${r?.name || '?'} 完成了「${task.area}」清洁` });
  }
  persist();
  res.json(task);
});

app.delete('/api/houses/:id/tasks/:tid', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  house.tasks = house.tasks.filter((t) => t.id !== req.params.tid);
  persist();
  res.json({ ok: true });
});

/* ---------- 公共物品 ---------- */
app.post('/api/houses/:id/items', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const { name, quantity, unit, threshold, emoji } = req.body || {};
  if (!name) return res.status(400).json({ error: '请输入物品名' });
  const item = {
    id: uid(), name, quantity: Number(quantity) || 0, unit: unit || '个',
    threshold: Number(threshold) || 1, emoji: emoji || '📦',
  };
  house.items.push(item);
  persist();
  res.status(201).json(item);
});

// 消耗登记
app.post('/api/houses/:id/items/:iid/use', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const item = house.items.find((i) => i.id === req.params.iid);
  if (!item) return res.status(404).json({ error: '物品不存在' });
  const { amount, userId } = req.body || {};
  const n = Number(amount);
  if (!n || n <= 0) return res.status(400).json({ error: '消耗数量无效' });
  item.quantity = Math.max(0, item.quantity - n);
  const usage = { id: uid(), itemId: item.id, amount: n, userId, date: new Date().toISOString().slice(0, 10) };
  house.usages.push(usage);
  const r = roommateOf(house, userId);
  logActivity(house, { type: 'item', icon: '📦', text: `${r?.name || '?'} 消耗了 ${item.name} ${n}${item.unit}` });
  persist();
  res.status(201).json({ item, usage });
});

// 补货
app.post('/api/houses/:id/items/:iid/restock', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const item = house.items.find((i) => i.id === req.params.iid);
  if (!item) return res.status(404).json({ error: '物品不存在' });
  const n = Number(req.body?.amount);
  if (!n || n <= 0) return res.status(400).json({ error: '补货数量无效' });
  item.quantity += n;
  persist();
  res.json(item);
});

app.delete('/api/houses/:id/items/:iid', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  house.items = house.items.filter((i) => i.id !== req.params.iid);
  house.usages = house.usages.filter((u) => u.itemId !== req.params.iid);
  persist();
  res.json({ ok: true });
});

/* ---------- 室友公约 ---------- */
app.post('/api/houses/:id/rules', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const { title, content, creatorId } = req.body || {};
  if (!title) return res.status(400).json({ error: '请输入条款标题' });
  const rule = { id: uid(), title, content: content || '', likes: 0, dislikes: 0, votes: [] };
  house.rules.push(rule);
  const r = roommateOf(house, creatorId);
  logActivity(house, { type: 'rule', icon: '📜', text: `${r?.name || '有人'} 发起了新公约「${title}」` });
  persist();
  res.status(201).json(rule);
});

// 投票（同一室友同一条款只能投一票，可撤回重投）
app.post('/api/houses/:id/rules/:rid/vote', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  const rule = house.rules.find((r) => r.id === req.params.rid);
  if (!rule) return res.status(404).json({ error: '条款不存在' });
  const { type, userId } = req.body || {};
  if (!['like', 'dislike'].includes(type)) return res.status(400).json({ error: '投票类型无效' });
  const prev = rule.votes.find((v) => v.userId === userId);
  if (prev) {
    if (prev.type === type) return res.status(400).json({ error: '已投过票' });
    if (prev.type === 'like') rule.likes--; else rule.dislikes--;
    prev.type = type;
  } else {
    rule.votes.push({ userId, type });
  }
  if (type === 'like') rule.likes++; else rule.dislikes++;
  persist();
  res.json(rule);
});

app.delete('/api/houses/:id/rules/:rid', (req, res) => {
  const house = houseOr404(req, res);
  if (!house) return;
  house.rules = house.rules.filter((r) => r.id !== req.params.rid);
  persist();
  res.json({ ok: true });
});

/* ---------- 生产环境：托管前端构建产物（SPA 回退） ---------- */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] 合租生活管家 API 已启动: http://localhost:${PORT}`);
});
