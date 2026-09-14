import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Page, Card } from '../components/Layout';
import { useHouse } from '../store/HouseContext';
import { fmtDate } from '../utils';

export default function Rules() {
  const { house, me, addRule, voteRule, deleteRule } = useHouse();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  if (!house) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { alert('请输入条款标题'); return; }
    setBusy(true);
    const ok = await addRule({ title: title.trim(), content: content.trim(), creatorId: me?.id });
    if (ok) { setTitle(''); setContent(''); }
    setBusy(false);
  };

  const vote = (rid, type) => voteRule(rid, { type, userId: me?.id });

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-clay-200 bg-cream/50 text-charcoal focus:outline-none focus:border-clay-400 transition-colors';

  const ruleLogs = (house.activities || []).filter((a) => a.type === 'rule');

  return (
    <Page title="室友公约" subtitle="共同约定、动态投票、和谐共处" emoji="📜">
      {/* 新增条款 */}
      <Card className="mb-6">
        <h2 className="text-lg text-charcoal mb-4">新增条款</h2>
        <form onSubmit={submit} className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="条款标题" className={inputCls} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="条款内容描述..." rows={2} className={`${inputCls} resize-none`} />
          <button type="submit" disabled={busy} className="w-full py-3 rounded-full bg-clay-500 text-white font-semibold hover:bg-clay-600 transition-colors disabled:opacity-50">
            {busy ? '添加中…' : '添加公约'}
          </button>
        </form>
      </Card>

      {/* 公约条款 */}
      <div className="space-y-4">
        {house.rules.map((r, i) => {
          const myVote = r.votes?.find((v) => v.userId === me?.id)?.type;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-clay-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-charcoal">{r.title}</h3>
                    <p className="text-sm text-sage-500 mt-1 leading-relaxed">{r.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => vote(r.id, 'like')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          myVote === 'like' ? 'bg-sage-200 text-sage-500 ring-1 ring-sage-300' : r.likes > r.dislikes ? 'bg-sage-100 text-sage-500' : 'bg-cream text-sage-400'
                        } hover:bg-sage-200`}
                      >
                        <ThumbsUp size={14} /> {r.likes}
                      </button>
                      <button
                        onClick={() => vote(r.id, 'dislike')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          myVote === 'dislike' ? 'bg-clay-200 text-clay-600 ring-1 ring-clay-300' : r.dislikes >= r.likes ? 'bg-clay-100 text-clay-600' : 'bg-cream text-sage-400'
                        } hover:bg-clay-200`}
                      >
                        <ThumbsDown size={14} /> {r.dislikes}
                      </button>
                      <button onClick={() => confirm('删除该条款？') && deleteRule(r.id)} className="ml-auto text-sage-400 hover:text-clay-500 flex items-center gap-1 text-xs">
                        <Trash2 size={14} /> 删除
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {house.rules.length === 0 && <p className="text-sm text-sage-400 text-center py-6">还没有公约条款，来发起第一条吧</p>}
      </div>

      {/* 公约日志 */}
      {ruleLogs.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg text-charcoal mb-4">公约日志</h2>
          {ruleLogs.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-clay-50 last:border-0">
              <span className="text-xl">{a.icon}</span>
              <div className="flex-1">
                <p className="text-sm text-charcoal">{a.text}</p>
                <p className="text-xs text-sage-400 mt-0.5">{fmtDate(a.date)}</p>
              </div>
              {idx === 0 && <span className="px-2 py-1 rounded-full bg-sage-100 text-sage-500 text-[10px] font-bold">最新</span>}
            </div>
          ))}
        </Card>
      )}

      {/* 室友名片 */}
      <Card className="mt-6">
        <h2 className="text-lg text-charcoal mb-4">室友名片</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {house.roommates.map((r) => (
            <div key={r.id} className="text-center p-4 rounded-xl bg-cream/50 hover:bg-cream transition-colors">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: `${r.color}20` }}>
                {r.avatar}
              </div>
              <p className="text-sm font-bold text-charcoal mt-2">{r.name}{r.role === 'owner' ? ' 👑' : ''}</p>
              <p className="text-xs text-sage-400">{r.room}</p>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}
