import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Page, Card } from '../components/Layout';
import { useHouse } from '../store/HouseContext';
import { fmtDate, dateStr, addDays, isToday, AREAS } from '../utils';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

export default function Cleaning() {
  const { house, addTask, toggleTask, deleteTask } = useHouse();
  const [area, setArea] = useState(AREAS[0]);
  const [assigneeId, setAssigneeId] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);

  if (!house) return null;
  const rm = (id) => house.roommates.find((r) => r.id === id) || { name: '?', avatar: '❓' };

  // 本周（周一起）
  const now = new Date();
  const monday = addDays(now, -((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekTasks = house.tasks.filter((t) => weekDays.some((d) => dateStr(d) === t.date));

  const doneCount = house.tasks.filter((t) => t.done).length;
  const completionRate = house.tasks.length > 0 ? Math.round((doneCount / house.tasks.length) * 100) : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!date) { alert('请选择日期'); return; }
    setBusy(true);
    const ok = await addTask({ area, date, assigneeId: assigneeId || house.roommates[0]?.id });
    if (ok) setDate('');
    setBusy(false);
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-clay-200 bg-cream/50 text-charcoal focus:outline-none focus:border-clay-400 transition-colors';

  return (
    <Page title="清洁排班" subtitle="轮值排班、打卡记录，值日不遗漏" emoji="🧹">
      {/* 完成率 */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg text-charcoal">总体完成率</h2>
          <span className="text-2xl font-serif text-sage-500">{completionRate}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-cream overflow-hidden">
          <motion.div
            className="h-full bg-sage-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-sage-400 mt-2">{doneCount}/{house.tasks.length} 项任务已完成</p>
      </Card>

      {/* 新增任务 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">新增值日任务</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <select value={area} onChange={(e) => setArea(e.target.value)} className={inputCls}>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputCls}>
            {house.roommates.map((r) => <option key={r.id} value={r.id}>{r.avatar} {r.name}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} col-span-2`} />
          <button type="submit" disabled={busy} className="col-span-2 py-3 rounded-full bg-sage-400 text-white font-semibold hover:bg-sage-500 transition-colors disabled:opacity-50">
            {busy ? '添加中…' : '添加排班'}
          </button>
        </form>
      </Card>

      {/* 周日历 */}
      <Card>
        <h2 className="text-lg text-charcoal mb-4">本周值日</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const ds = dateStr(d);
            const tasks = weekTasks.filter((t) => t.date === ds);
            const current = isToday(ds);
            const dl = DAY_LABELS[(d.getDay() + 6) % 7];
            return (
              <div key={ds} className={`min-h-[120px] rounded-xl p-2 ${current ? 'bg-clay-50 border-2 border-clay-300' : 'bg-cream/50 border border-clay-100'}`}>
                <p className={`text-xs font-bold text-center ${current ? 'text-clay-600' : 'text-sage-400'}`}>周{dl}</p>
                <p className="text-sm font-bold text-charcoal text-center mb-2">{d.getDate()}</p>
                {tasks.map((t) => {
                  const r = rm(t.assigneeId);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      title="点击打卡"
                      className={`cursor-pointer mb-1 p-1.5 rounded-lg text-center hover:shadow-sm transition-all ${
                        t.done ? 'bg-sage-50 line-through opacity-60' : 'bg-white'
                      }`}
                    >
                      <span className="text-lg block">{r.avatar}</span>
                      <span className="text-[10px] text-charcoal block">{t.area}</span>
                      {t.done && <CheckCircle2 size={12} className="mx-auto text-sage-500" />}
                    </div>
                  );
                })}
                {tasks.length === 0 && <p className="text-[10px] text-sage-300 text-center mt-4">—</p>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 轮值历史 */}
      <Card className="mt-6">
        <h2 className="text-lg text-charcoal mb-4">值日记录</h2>
        {house.tasks.filter((t) => t.done).slice().reverse().map((t) => {
          const r = rm(t.assigneeId);
          return (
            <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-clay-50 last:border-0">
              <span className="text-2xl">{r.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">{r.name} 完成了「{t.area}」</p>
                <p className="text-xs text-sage-400">{fmtDate(t.doneAt)}</p>
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-sage-400 hover:text-clay-500 text-xs">删除</button>
            </div>
          );
        })}
        {doneCount === 0 && <p className="text-sm text-sage-400 py-4 text-center">暂无完成记录</p>}
      </Card>
    </Page>
  );
}
