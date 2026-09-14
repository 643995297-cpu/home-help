import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Page, Card } from '../components/Layout';
import { useHouse } from '../store/HouseContext';
import { fmtMoney, fmtDate, dateStr, CATEGORIES } from '../utils';

export default function Expenses() {
  const { house, me, addExpense, deleteExpense } = useHouse();
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [splits, setSplits] = useState(null);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('全部');
  const [busy, setBusy] = useState(false);

  if (!house) return null;
  const rm = (id) => house.roommates.find((r) => r.id === id) || { name: '?', avatar: '❓' };
  const currentPayer = payerId || me?.id;
  const selectedSplits = splits || house.roommates.map((r) => r.id);

  const toggleSplit = (rid) => {
    setSplits((prev) => {
      const cur = prev || house.roommates.map((r) => r.id);
      return cur.includes(rid) ? cur.filter((x) => x !== rid) : [...cur, rid];
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) { alert('请输入有效金额'); return; }
    if (selectedSplits.length === 0) { alert('请选择分摊对象'); return; }
    setBusy(true);
    const ok = await addExpense({
      amount: n, category, payerId: currentPayer,
      date: dateStr(), note: note.trim(), splitAmong: selectedSplits,
    });
    if (ok) { setAmount(''); setNote(''); setSplits(null); }
    setBusy(false);
  };

  // 按月分组（支持分类筛选）
  const filtered = filter === '全部' ? house.expenses : house.expenses.filter((e) => e.category === filter);
  const byMonth = {};
  filtered.forEach((e) => {
    const m = e.date.slice(0, 7);
    (byMonth[m] = byMonth[m] || []).push(e);
  });
  const months = Object.keys(byMonth).sort().reverse();

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-clay-200 bg-cream/50 text-charcoal focus:outline-none focus:border-clay-400 transition-colors';

  return (
    <Page title="费用分摊" subtitle="记账、AA分摊、谁欠谁一目了然" emoji="💰">
      {/* 结算总览 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">结算总览</h2>
        {house.settlement?.debts?.length > 0 ? house.settlement.debts.map((d, i) => {
          const from = rm(d.from); const to = rm(d.to);
          return (
            <motion.div
              key={`${d.from}-${d.to}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2.5 border-b border-clay-50 last:border-0"
            >
              <span className="text-2xl">{from.avatar}</span>
              <span className="text-sm font-semibold text-charcoal">{from.name}</span>
              <span className="text-sage-400 text-sm">欠</span>
              <span className="text-2xl">{to.avatar}</span>
              <span className="text-sm font-semibold text-charcoal">{to.name}</span>
              <span className="ml-auto px-3 py-1 rounded-full bg-clay-100 text-clay-600 text-sm font-bold">{fmtMoney(d.amount)}</span>
            </motion.div>
          );
        }) : <p className="text-sm text-sage-400 py-4 text-center">大家已结清，没有欠账 🎉</p>}
      </Card>

      {/* 记账表单 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">记一笔</h2>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-sage-500 font-semibold">金额</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="0.00" className={`mt-1 ${inputCls}`} />
            </div>
            <div>
              <label className="text-xs text-sage-500 font-semibold">付款人</label>
              <select value={currentPayer} onChange={(e) => setPayerId(e.target.value)} className={`mt-1 ${inputCls}`}>
                {house.roommates.map((r) => <option key={r.id} value={r.id}>{r.avatar} {r.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-sage-500 font-semibold">分类</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIES.map((c) => (
                <button
                  type="button" key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    category === c ? 'bg-clay-500 text-white border-clay-500' : 'bg-cream text-sage-500 border-clay-200 hover:border-clay-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-sage-500 font-semibold">分摊给</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {house.roommates.map((r) => {
                const on = selectedSplits.includes(r.id);
                return (
                  <button
                    type="button" key={r.id} onClick={() => toggleSplit(r.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      on ? 'bg-sage-100 text-sage-500 border-sage-300' : 'bg-cream text-sage-500 border-clay-200'
                    }`}
                  >
                    {r.avatar} {r.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-sage-400 mt-2">已选 {selectedSplits.length} 人 · 每人约 {amount > 0 ? fmtMoney(parseFloat(amount) / selectedSplits.length) : '¥0'}</p>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" className={inputCls} />
          <button type="submit" disabled={busy} className="w-full py-3 rounded-full bg-clay-500 text-white font-semibold hover:bg-clay-600 transition-colors disabled:opacity-50">
            {busy ? '保存中…' : '记 账'}
          </button>
        </form>
      </Card>

      {/* 账单流水 */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg text-charcoal">账单流水</h2>
          <div className="flex flex-wrap gap-1.5">
            {['全部', ...CATEGORIES].map((c) => (
              <button
                key={c} onClick={() => setFilter(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  filter === c ? 'bg-clay-500 text-white' : 'bg-cream text-sage-500 hover:bg-clay-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {months.map((m) => {
          const list = byMonth[m];
          const total = list.reduce((s, e) => s + e.amount, 0);
          return (
            <div key={m} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-clay-100">
                <h3 className="text-sm font-bold text-charcoal">{parseInt(m.slice(5), 10)}月</h3>
                <span className="text-sm font-bold text-clay-600">{fmtMoney(total)}</span>
              </div>
              {list.map((e) => {
                const r = rm(e.payerId);
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2.5">
                    <span className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-lg shrink-0">{r.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{e.category}{e.note ? ` · ${e.note}` : ''}</p>
                      <p className="text-xs text-sage-400">{r.name}垫付 · {fmtDate(e.date)} · 每人{fmtMoney(e.amount / e.splitAmong.length)}</p>
                    </div>
                    <span className="text-sm font-bold text-clay-600">{fmtMoney(e.amount)}</span>
                    <button onClick={() => confirm('删除这笔账单？') && deleteExpense(e.id)} className="text-sage-400 hover:text-clay-500" title="删除">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {months.length === 0 && <p className="text-sm text-sage-400 py-4 text-center">暂无账单</p>}
      </Card>
    </Page>
  );
}
