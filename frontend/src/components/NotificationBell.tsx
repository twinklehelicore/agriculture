import { useEffect, useRef, useState } from 'react';
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from '../api/notification';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const role = user?.role ?? '';

  const fetchCount = async () => {
    try {
      const res = await getUnreadCount(role);
      setUnread(res.data.count);
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(role);
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    if (!role || role === 'ADMIN') return;
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [role]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open) {
      await fetchNotifications();
    }
  };

  const handleMarkAll = async () => {
    await markAllRead(role);
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: number) => {
    await markOneRead(role, id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnread(prev => Math.max(0, prev - 1));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!role || role === 'ADMIN') return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
       {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unread > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <div className="text-3xl mb-2">🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkOne(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.isRead ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-gray-800 ${!n.isRead ? 'font-semibold' : ''}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}