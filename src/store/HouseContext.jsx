import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const HouseCtx = createContext(null);

const LS_HOUSE = 'home_help_house_id';
const LS_USER = 'home_help_user_id';

export function HouseProvider({ children }) {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [houseId, setHouseId] = useState(() => localStorage.getItem(LS_HOUSE) || '');
  const [userId, setUserId] = useState(() => localStorage.getItem(LS_USER) || '');

  const refresh = useCallback(async () => {
    if (!houseId) { setLoading(false); return; }
    setError('');
    try {
      const data = await api.getHouse(houseId);
      setHouse(data);
      if (userId && !data.roommates.some((r) => r.id === userId)) {
        // 身份失效（数据被重置等），退回第一个室友
        if (data.roommates.length > 0) switchUser(data.roommates[0].id);
      }
    } catch (e) {
      setHouse(null);
      setHouseId('');
      localStorage.removeItem(LS_HOUSE);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [houseId, userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const enterHouse = (id, uid) => {
    localStorage.setItem(LS_HOUSE, id);
    localStorage.setItem(LS_USER, uid);
    setHouseId(id);
    setUserId(uid);
    setLoading(true);
  };

  const exitHouse = () => {
    localStorage.removeItem(LS_HOUSE);
    localStorage.removeItem(LS_USER);
    setHouseId('');
    setUserId('');
    setHouse(null);
  };

  const switchUser = (id) => {
    localStorage.setItem(LS_USER, id);
    setUserId(id);
  };

  const me = useMemo(
    () => house?.roommates?.find((r) => r.id === userId) || house?.roommates?.[0] || null,
    [house, userId],
  );

  // 统一的"操作后刷新"包装
  const act = useCallback(async (fn) => {
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      alert(e.message);
      return false;
    }
  }, [refresh]);

  const actions = useMemo(() => ({
    addExpense: (body) => act(() => api.addExpense(houseId, body)),
    deleteExpense: (eid) => act(() => api.deleteExpense(houseId, eid)),
    addTask: (body) => act(() => api.addTask(houseId, body)),
    toggleTask: (tid) => act(() => api.toggleTask(houseId, tid)),
    deleteTask: (tid) => act(() => api.deleteTask(houseId, tid)),
    addItem: (body) => act(() => api.addItem(houseId, body)),
    useItem: (iid, body) => act(() => api.useItem(houseId, iid, body)),
    restockItem: (iid, body) => act(() => api.restockItem(houseId, iid, body)),
    deleteItem: (iid) => act(() => api.deleteItem(houseId, iid)),
    addRule: (body) => act(() => api.addRule(houseId, body)),
    voteRule: (rid, body) => act(() => api.voteRule(houseId, rid, body)),
    deleteRule: (rid) => act(() => api.deleteRule(houseId, rid)),
  }), [act, houseId]);

  const value = {
    house, loading, error, me, userId,
    hasSession: Boolean(houseId),
    enterHouse, exitHouse, switchUser, refresh, ...actions,
  };

  return <HouseCtx.Provider value={value}>{children}</HouseCtx.Provider>;
}

export function useHouse() {
  const ctx = useContext(HouseCtx);
  if (!ctx) throw new Error('useHouse 必须在 HouseProvider 内使用');
  return ctx;
}
