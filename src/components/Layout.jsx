import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Wallet, Brush, Package, ScrollText, LogOut } from 'lucide-react';
import { useHouse } from '../store/HouseContext';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/expenses', label: '费用', icon: Wallet },
  { path: '/cleaning', label: '值日', icon: Brush },
  { path: '/items', label: '物品', icon: Package },
  { path: '/rules', label: '公约', icon: ScrollText },
];

export default function Layout({ children }) {
  const { house, me, exitHouse } = useHouse();
  const navigate = useNavigate();

  const handleExit = () => {
    if (confirm('确定退出当前房屋吗？')) {
      exitHouse();
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 桌面侧边导航 */}
      <nav className="desktop-nav fixed left-0 top-0 h-screen w-60 bg-white/70 backdrop-blur border-r border-clay-200 flex flex-col z-30">
        <div className="px-6 py-7">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-serif text-xl text-charcoal">合租管家</span>
          </div>
          <p className="text-xs text-sage-500 mt-1 ml-9">{house?.name || '让生活更和谐'}</p>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-clay-500 text-white shadow-lg shadow-clay-200'
                    : 'text-charcoal hover:bg-clay-50'
                }`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="px-4 py-4 border-t border-clay-100">
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-cream">
            {house?.roommates?.slice(0, 4).map((r) => (
              <span key={r.id} className="text-lg" title={r.name}>{r.avatar}</span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <p className="text-xs text-sage-500">
              {house?.roommates?.length || 0}位室友 · 我是{me?.avatar}{me?.name}
            </p>
            <button onClick={handleExit} title="退出房屋" className="text-sage-400 hover:text-clay-500">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 md:ml-60 main-pad pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>

      {/* 移动端底部导航 */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-clay-200 flex z-30">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 min-h-[44px] ${
                isActive ? 'text-clay-600' : 'text-sage-400'
              }`
            }
          >
            <Icon size={22} strokeWidth={2.2} />
            <span className="text-[10px] font-semibold mt-0.5">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Page({ children, title, subtitle, emoji, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h1 className="text-3xl text-charcoal leading-none">{title}</h1>
            <p className="text-sm text-sage-500 mt-1">{subtitle}</p>
          </div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-clay-100 ${className}`} {...rest}>
      {children}
    </div>
  );
}
