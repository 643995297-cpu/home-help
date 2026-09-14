import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Page, Card } from '../components/Layout';
import { useHouse } from '../store/HouseContext';
import { fmtMoney, fmtDate, isToday } from '../utils';

export default function Dashboard() {
  const { house, me, toggleTask } = useHouse();
  if (!house) return null;

  const rm = (id) => house.roommates.find((r) => r.id === id) || { name: '?', avatar: '❓' };
  const thisMonth = new Date().getMonth();
  const monthExpenses = house.expenses.filter((e) => new Date(e.date).getMonth() === thisMonth);
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const myShare = house.expenses
    .filter((e) => e.splitAmong.includes(me?.id))
    .reduce((s, e) => s + e.amount / e.splitAmong.length, 0);
  const todayTasks = house.tasks.filter((t) => isToday(t.date));
  const pendingTasks = todayTasks.filter((t) => !t.done);
  const lowItems = house.items.filter((i) => i.quantity <= i.threshold);
  const unsettled = house.settlement?.debts?.length || 0;

  const cards = [
    { label: '本月总支出', value: fmtMoney(monthTotal), sub: `${monthExpenses.length} 笔记录`, cls: 'text-clay-600' },
    { label: '我的分摊', value: fmtMoney(myShare), sub: '累计待结算', cls: 'text-sage-500' },
    { label: '今日值日', value: pendingTasks.length > 0 ? `${pendingTasks.length}项` : '已完成', sub: pendingTasks.length > 0 ? '还有任务待完成' : '今日清洁已搞定', cls: 'text-charcoal' },
    { label: '物品预警', value: `${lowItems.length}件`, sub: '需补货', cls: 'text-clay-600' },
  ];

  return (
    <Page title="今日合租" subtitle={`欢迎回家，${me?.name}！看看今天有什么需要关注`} emoji="🏠">
      {/* 概览卡组 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <Card className="p-5 hover:shadow-md transition-shadow h-full">
              <p className="text-xs text-sage-500 font-semibold">{c.label}</p>
              <p className={`text-2xl font-serif mt-1 ${c.cls}`}>{c.value}</p>
              <p className="text-xs text-sage-400 mt-1">{c.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 今日值日 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-charcoal">今日值日</h2>
            <Link to="/cleaning" className="text-xs text-clay-600 font-semibold hover:underline">查看排班 →</Link>
          </div>
          {todayTasks.length > 0 ? todayTasks.map((t) => {
            const r = rm(t.assigneeId);
            return (
              <div key={t.id} className="flex items-center gap-3 py-3 border-b border-clay-50 last:border-0">
                <span className="text-2xl">{r.avatar}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold text-charcoal ${t.done ? 'line-through opacity-60' : ''}`}>{r.name} · {t.area}</p>
                  <p className="text-xs text-sage-400">{t.done ? `已于 ${fmtDate(t.doneAt)} 完成` : '待完成'}</p>
                </div>
                {!t.done && (
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="px-3 py-1.5 rounded-full bg-sage-100 text-sage-500 text-xs font-semibold hover:bg-sage-200 transition-colors"
                  >
                    打卡
                  </button>
                )}
              </div>
            );
          }) : <p className="text-sm text-sage-400 py-4 text-center">今日没有值日任务 🎉</p>}
        </Card>

        {/* 物品预警 + 结算提醒 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-charcoal">物品预警</h2>
            <Link to="/items" className="text-xs text-clay-600 font-semibold hover:underline">管理物品 →</Link>
          </div>
          {lowItems.length > 0 ? lowItems.map((i) => (
            <div key={i.id} className="flex items-center gap-3 py-3 border-b border-clay-50 last:border-0">
              <span className="text-2xl">{i.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">{i.name}</p>
                <p className="text-xs text-clay-500">仅剩 {i.quantity}{i.unit}，需补货</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-clay-100 text-clay-600 text-xs font-bold">低</span>
            </div>
          )) : <p className="text-sm text-sage-400 py-4 text-center">库存充足 ✨</p>}

          <div className="mt-4 pt-4 border-t border-clay-100 flex items-center justify-between">
            <p className="text-sm text-sage-500 font-semibold">待结算关系</p>
            <Link to="/expenses" className="text-xs text-clay-600 font-semibold hover:underline">
              {unsettled > 0 ? `${unsettled} 笔欠款待结 →` : '已全部结清 🎉'}
            </Link>
          </div>
        </Card>
      </div>

      {/* 室友动态 */}
      <Card className="mt-6">
        <h2 className="text-lg text-charcoal mb-4">室友动态</h2>
        <div className="space-y-0">
          {(house.activities || []).slice(0, 8).map((a, idx, arr) => (
            <div key={a.id} className="flex gap-4" style={{ paddingBottom: idx < arr.length - 1 ? 16 : 0 }}>
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-base">{a.icon}</span>
                {idx < arr.length - 1 && <div className="w-px flex-1 bg-clay-100 my-1" />}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-charcoal">{a.text}</p>
                <p className="text-xs text-sage-400 mt-0.5">{fmtDate(a.date)}</p>
              </div>
            </div>
          ))}
          {(house.activities || []).length === 0 && (
            <p className="text-sm text-sage-400 py-4 text-center">暂无动态</p>
          )}
        </div>
      </Card>
    </Page>
  );
}
