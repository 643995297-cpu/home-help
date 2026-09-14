import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { AVATARS } from '../utils';
import { useHouse } from '../store/HouseContext';

export default function Welcome() {
  const { enterHouse } = useHouse();
  const [mode, setMode] = useState('create'); // create | join
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pickAvatar = (
    <div className="flex flex-wrap gap-2 mt-2">
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => setAvatar(a)}
          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
            avatar === a ? 'bg-clay-500 border-clay-500 scale-110' : 'bg-cream border-clay-200 hover:border-clay-300'
          }`}
        >
          {a}
        </button>
      ))}
    </div>
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !userName.trim()) { setErr('请填写房屋名称和你的昵称'); return; }
    setBusy(true); setErr('');
    try {
      const house = await api.createHouse({ name: name.trim(), ownerName: userName.trim(), avatar });
      enterHouse(house.id, house.roommates[0].id);
      alert(`房屋创建成功！邀请码：${house.code}，分享给室友一起加入吧`);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim() || !userName.trim()) { setErr('请填写邀请码和你的昵称'); return; }
    setBusy(true); setErr('');
    try {
      const { houseId, roommate } = await api.joinHouse({ code: code.trim(), name: userName.trim(), avatar });
      enterHouse(houseId, roommate.id);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  const handleDemo = async () => {
    setBusy(true); setErr('');
    try {
      const { houseId, roommate } = await api.joinHouse({ code: 'DEMO01', name: `访客${Math.floor(Math.random() * 90 + 10)}`, avatar: '🐸' });
      enterHouse(houseId, roommate.id);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-clay-200 bg-cream/50 text-charcoal focus:outline-none focus:border-clay-400 transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-5xl">🏠</span>
          <h1 className="font-serif text-4xl text-charcoal mt-3">合租生活管家</h1>
          <p className="text-sm text-sage-500 mt-2">费用分摊 · 清洁排班 · 公共物品 · 室友公约</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-clay-100 border border-clay-100">
          {/* 模式切换 */}
          <div className="flex gap-2 p-1 rounded-full bg-cream mb-6">
            {['create', 'join'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErr(''); }}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  mode === m ? 'bg-clay-500 text-white shadow' : 'text-sage-500'
                }`}
              >
                {m === 'create' ? '创建房屋' : '加入房屋'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-4">
            {mode === 'create' && (
              <div>
                <label className="text-xs text-sage-500 font-semibold">房屋名称</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：阳光小区3栋502" className={`mt-1 ${inputCls}`} />
              </div>
            )}
            {mode === 'join' && (
              <div>
                <label className="text-xs text-sage-500 font-semibold">邀请码</label>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="6位邀请码" maxLength={8} className={`mt-1 ${inputCls} tracking-widest font-bold`} />
              </div>
            )}
            <div>
              <label className="text-xs text-sage-500 font-semibold">我的昵称</label>
              <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="室友怎么称呼你" className={`mt-1 ${inputCls}`} />
            </div>
            <div>
              <label className="text-xs text-sage-500 font-semibold">选择头像</label>
              {pickAvatar}
            </div>

            {err && <p className="text-sm text-clay-600 text-center">{err}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-full bg-clay-500 text-white font-semibold hover:bg-clay-600 transition-colors disabled:opacity-50"
            >
              {busy ? '处理中…' : mode === 'create' ? '创建并成为房主' : '加入房屋'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-clay-100 text-center">
            <button onClick={handleDemo} disabled={busy} className="text-sm text-sage-500 font-semibold hover:text-clay-600">
              🎁 先体验演示数据（邀请码 DEMO01）
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
