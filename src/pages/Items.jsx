import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Page, Card } from '../components/Layout';
import { useHouse } from '../store/HouseContext';
import { fmtDate } from '../utils';

export default function Items() {
  const { house, me, addItem, useItem, restockItem, deleteItem } = useHouse();
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('');
  const [threshold, setThreshold] = useState('');
  const [busy, setBusy] = useState(false);

  if (!house) return null;
  const rm = (id) => house.roommates.find((r) => r.id === id) || { name: '?', avatar: '❓' };
  const lowItems = house.items.filter((i) => i.quantity <= i.threshold);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('请输入物品名'); return; }
    setBusy(true);
    const ok = await addItem({
      name: name.trim(), quantity: parseInt(qty, 10) || 0,
      unit: unit.trim() || '个', threshold: parseInt(threshold, 10) || 1,
    });
    if (ok) { setName(''); setQty(''); setUnit(''); setThreshold(''); }
    setBusy(false);
  };

  const handleUse = async (item) => {
    const n = parseInt(prompt(`消耗「${item.name}」数量：`, '1'), 10);
    if (!n || n <= 0) return;
    await useItem(item.id, { amount: n, userId: me?.id });
  };

  const handleRestock = async (item) => {
    const n = parseInt(prompt(`「${item.name}」补货数量：`, '5'), 10);
    if (!n || n <= 0) return;
    await restockItem(item.id, { amount: n });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-clay-200 bg-cream/50 text-charcoal focus:outline-none focus:border-clay-400 transition-colors';

  return (
    <Page title="公共物品" subtitle="库存登记、消耗记录、补货提醒" emoji="📦">
      {/* 补货提醒 */}
      {lowItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-clay-50 rounded-2xl p-4 mb-6 border border-clay-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <h2 className="text-sm font-bold text-clay-600">补货提醒</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowItems.map((i) => (
              <span key={i.id} className="px-3 py-1 rounded-full bg-white text-clay-600 text-xs font-semibold">
                {i.emoji} {i.name} 仅剩{i.quantity}{i.unit}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 添加物品 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">添加物品</h2>
        <form onSubmit={submit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="物品名" className={inputCls} />
          <input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="数量" className={inputCls} />
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="单位(包/瓶)" className={inputCls} />
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" placeholder="补货阈值" className={inputCls} />
          <button type="submit" disabled={busy} className="col-span-2 md:col-span-4 py-3 rounded-full bg-clay-500 text-white font-semibold hover:bg-clay-600 transition-colors disabled:opacity-50">
            {busy ? '添加中…' : '添加物品'}
          </button>
        </form>
      </Card>

      {/* 库存清单 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">库存清单</h2>
        {house.items.map((i) => {
          const pct = Math.min(100, (i.quantity / (i.threshold * 3 + 1)) * 100);
          const isLow = i.quantity <= i.threshold;
          return (
            <div key={i.id} className="py-3 border-b border-clay-50 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{i.emoji || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal">
                    {i.name} {isLow && <span className="text-clay-500 text-xs">·需补货</span>}
                  </p>
                  <p className="text-xs text-sage-400">剩余 {i.quantity} {i.unit} · 阈值 {i.threshold}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleUse(i)} className="px-3 py-1.5 rounded-lg bg-sage-100 text-sage-500 text-xs font-semibold hover:bg-sage-200">消耗</button>
                  <button onClick={() => handleRestock(i)} className="px-3 py-1.5 rounded-lg bg-clay-100 text-clay-600 text-xs font-semibold hover:bg-clay-200">补货</button>
                  <button onClick={() => confirm(`删除「${i.name}」？`) && deleteItem(i.id)} className="px-2 py-1.5 rounded-lg text-sage-400 hover:text-clay-500" title="删除">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-cream overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isLow ? 'bg-clay-400' : 'bg-sage-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
        {house.items.length === 0 && <p className="text-sm text-sage-400 py-4 text-center">还没有登记物品</p>}
      </Card>

      {/* 消耗记录 */}
      <Card>
        <h2 className="text-lg text-charcoal mb-4">消耗记录</h2>
        {house.usages.slice().reverse().map((u) => {
          const item = house.items.find((i) => i.id === u.itemId);
          const r = rm(u.userId);
          return (
            <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-clay-50 last:border-0">
              <span className="text-xl">{item?.emoji || '📦'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">{r.name} 消耗了 {item?.name || '已删除物品'}</p>
                <p className="text-xs text-sage-400">{fmtDate(u.date)}</p>
              </div>
              <span className="text-sm font-bold text-clay-600">-{u.amount}{item?.unit || ''}</span>
            </div>
          );
        })}
        {house.usages.length === 0 && <p className="text-sm text-sage-400 py-4 text-center">暂无消耗记录</p>}
      </Card>
    </Page>
  );
}
