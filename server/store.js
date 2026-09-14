import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export const uid = () => crypto.randomBytes(6).toString('hex');
const dateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/* ---------- 演示数据 ---------- */
function seedDemoHouse() {
  const today = new Date();
  const roommates = [
    { id: 'r1', name: '小林', avatar: '🦊', room: '主卧A', color: '#C4663A', role: 'owner' },
    { id: 'r2', name: '阿杰', avatar: '🐻', room: '次卧B', color: '#7A8B6F', role: 'member' },
    { id: 'r3', name: '柚柚', avatar: '🐰', room: '次卧C', color: '#D4945E', role: 'member' },
    { id: 'r4', name: '大伟', avatar: '🐼', room: '客厅隔断', color: '#9AAE88', role: 'member' },
  ];
  const expenses = [
    { id: 'e1', amount: 2400, category: '房租', payerId: 'r1', date: dateStr(today), note: '本月房租', splitAmong: ['r1', 'r2', 'r3', 'r4'] },
    { id: 'e2', amount: 186, category: '水电', payerId: 'r2', date: dateStr(addDays(today, -2)), note: '水费+电费', splitAmong: ['r1', 'r2', 'r3', 'r4'] },
    { id: 'e3', amount: 89, category: '日用', payerId: 'r3', date: dateStr(addDays(today, -5)), note: '清洁用品团购', splitAmong: ['r1', 'r2', 'r3'] },
    { id: 'e4', amount: 320, category: '网费', payerId: 'r1', date: dateStr(addDays(today, -15)), note: '宽带年费分摊', splitAmong: ['r1', 'r2', 'r3', 'r4'] },
    { id: 'e5', amount: 45.5, category: '餐饮', payerId: 'r4', date: dateStr(addDays(today, -1)), note: '周末火锅', splitAmong: ['r1', 'r2', 'r3', 'r4'] },
  ];
  const tasks = [
    { id: 't1', area: '厨房', date: dateStr(today), assigneeId: 'r1', done: false, doneAt: '' },
    { id: 't2', area: '卫生间', date: dateStr(today), assigneeId: 'r2', done: false, doneAt: '' },
    { id: 't3', area: '客厅', date: dateStr(addDays(today, -1)), assigneeId: 'r3', done: true, doneAt: dateStr(addDays(today, -1)) },
    { id: 't4', area: '倒垃圾', date: dateStr(addDays(today, 1)), assigneeId: 'r4', done: false, doneAt: '' },
    { id: 't5', area: '厨房', date: dateStr(addDays(today, 2)), assigneeId: 'r2', done: false, doneAt: '' },
    { id: 't6', area: '卫生间', date: dateStr(addDays(today, 3)), assigneeId: 'r1', done: false, doneAt: '' },
    { id: 't7', area: '客厅', date: dateStr(addDays(today, 4)), assigneeId: 'r4', done: false, doneAt: '' },
    { id: 't8', area: '倒垃圾', date: dateStr(addDays(today, 5)), assigneeId: 'r3', done: false, doneAt: '' },
  ];
  const items = [
    { id: 'i1', name: '抽纸', quantity: 3, unit: '包', threshold: 2, emoji: '🧻' },
    { id: 'i2', name: '洗洁精', quantity: 1, unit: '瓶', threshold: 1, emoji: '🧴' },
    { id: 'i3', name: '垃圾袋', quantity: 8, unit: '个', threshold: 5, emoji: '🗑️' },
    { id: 'i4', name: '洗手液', quantity: 2, unit: '瓶', threshold: 1, emoji: '🧼' },
    { id: 'i5', name: '洁厕灵', quantity: 0, unit: '瓶', threshold: 1, emoji: '🚽' },
  ];
  const usages = [
    { id: 'u1', itemId: 'i1', amount: 1, userId: 'r2', date: dateStr(addDays(today, -3)) },
    { id: 'u2', itemId: 'i3', amount: 2, userId: 'r1', date: dateStr(addDays(today, -1)) },
    { id: 'u3', itemId: 'i5', amount: 1, userId: 'r4', date: dateStr(addDays(today, -2)) },
  ];
  const rules = [
    { id: 'ru1', title: '22:30后降低音量', content: '晚上10点半后，大家休息时段，请自觉调低手机、电视音量，戴耳机更佳。', likes: 4, dislikes: 0, votes: [] },
    { id: 'ru2', title: '公共区域当日清洁', content: '当天值日的室友需在当晚12点前完成清洁任务并打卡，特殊情况可提前协调换班。', likes: 4, dislikes: 1, votes: [] },
    { id: 'ru3', title: '冰箱食物贴标签', content: '冰箱内个人食物请贴上姓名标签和日期，未贴标的视为公共可取用。存放超3天视为丢弃。', likes: 3, dislikes: 0, votes: [] },
    { id: 'ru4', title: '公共物品低于阈值即补', content: '公共物品库存低于补货阈值时，值日室友负责采购，费用记入AA分摊。', likes: 4, dislikes: 0, votes: [] },
    { id: 'ru5', title: '访客留宿提前告知', content: '如有朋友来访并留宿，需在室友群提前告知，留宿不超过2晚。', likes: 3, dislikes: 1, votes: [] },
  ];
  const activities = [
    { id: uid(), type: 'expense', icon: '💰', text: '大伟 记了一笔 餐饮 ¥45.5', date: dateStr(addDays(today, -1)) },
    { id: uid(), type: 'task', icon: '✅', text: '柚柚 完成了「客厅」清洁', date: dateStr(addDays(today, -1)) },
    { id: uid(), type: 'item', icon: '📦', text: '小林 消耗了 垃圾袋 2个', date: dateStr(addDays(today, -1)) },
    { id: uid(), type: 'rule', icon: '📜', text: '小林 发起了新公约「22:30后降低音量」', date: dateStr(addDays(today, -6)) },
  ];
  return {
    id: uid(),
    name: '阳光小区3栋502',
    code: 'DEMO01',
    createdAt: dateStr(addDays(today, -30)),
    roommates, expenses, tasks, items, usages, rules, activities,
  };
}

/* ---------- 持久化 ---------- */
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  const db = { houses: [seedDemoHouse()] };
  save(db);
  return db;
}
function save(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

const db = load();

export function findHouse(id) {
  return db.houses.find((h) => h.id === id);
}
export function findHouseByCode(code) {
  return db.houses.find((h) => h.code.toUpperCase() === String(code).toUpperCase());
}
export function createHouse({ name, ownerName, avatar, room }) {
  const house = {
    id: uid(),
    name: name || '我的合租房',
    code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    createdAt: dateStr(),
    roommates: [{
      id: uid(), name: ownerName || '房主', avatar: avatar || '🏠',
      room: room || '主卧A', color: '#C4663A', role: 'owner',
    }],
    expenses: [], tasks: [], items: [], usages: [], rules: [], activities: [],
  };
  db.houses.push(house);
  save(db);
  return house;
}
export function joinHouse(house, { name, avatar, room }) {
  const roommate = {
    id: uid(), name: name || '新室友', avatar: avatar || '🙂',
    room: room || `房间${house.roommates.length + 1}`, color: '#7A8B6F', role: 'member',
  };
  house.roommates.push(roommate);
  save(db);
  return roommate;
}
export function persist() {
  save(db);
}
export function logActivity(house, { type, icon, text }) {
  house.activities.unshift({ id: uid(), type, icon, text, date: dateStr() });
  house.activities = house.activities.slice(0, 50);
}

/* ---------- 结算计算 ---------- */
export function settlementOf(house) {
  const balances = {};
  house.roommates.forEach((r) => { balances[r.id] = 0; });
  house.expenses.forEach((e) => {
    const share = e.amount / e.splitAmong.length;
    balances[e.payerId] += e.amount;
    e.splitAmong.forEach((rid) => { balances[rid] -= share; });
  });
  const debts = [];
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.01)
    .map((x) => [...x]).sort((a, b) => a[1] - b[1]);
  creditors.forEach(([cid, cv]) => {
    let remain = cv;
    for (const d of debtors) {
      if (remain <= 0.01 || d[1] >= -0.01) continue;
      const pay = Math.min(remain, -d[1]);
      if (pay > 0.01) {
        debts.push({ from: d[0], to: cid, amount: Math.round(pay * 100) / 100 });
        d[1] += pay;
        remain -= pay;
      }
    }
  });
  return { balances, debts };
}
