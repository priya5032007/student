import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X, Sun, Moon, LogOut, User, Settings, Shield, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from './ui';
import api from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const { dark, toggle } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef();
  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults(null); return; }
    const t = setTimeout(async () => {
      const { data } = await api.get(`/search?q=${searchQ}`);
      setSearchResults(data);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  const navLinks = [
    { to: '/feed', label: 'Feed' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/events', label: 'Events' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">CC</div>
          <span className="font-bold text-white hidden sm:block">CampusConnect</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}>{l.label}</Link>
          ))}
        </div>

        <div className="flex-1 max-w-md mx-auto relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search clubs, events, students..."
              className="input pl-9 py-2 text-sm"
            />
          </div>
          <AnimatePresence>
            {searchResults && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-full mt-2 w-full glass-strong rounded-xl p-3 space-y-3 z-50">
                {searchResults.clubs?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">CLUBS</p>
                    {searchResults.clubs.map(c => (
                      <Link key={c.id} to={`/clubs/${c.id}`} onClick={() => setSearchQ('')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center text-xs">{c.name[0]}</div>
                        <span className="text-sm text-white">{c.name}</span>
                        <span className="text-xs text-slate-500 ml-auto">{c.category}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.events?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">EVENTS</p>
                    {searchResults.events.map(e => (
                      <Link key={e.id} to={`/events/${e.id}`} onClick={() => setSearchQ('')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center text-xs">🎯</div>
                        <span className="text-sm text-white">{e.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.users?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-medium">STUDENTS</p>
                    {searchResults.users.map(u => (
                      <Link key={u.id} to={`/profile/${u.id}`} onClick={() => setSearchQ('')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <Avatar src={u.avatar} name={u.name} size="sm" />
                        <span className="text-sm text-white">{u.name}</span>
                        <span className="text-xs text-slate-500 ml-auto">{u.department}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {!searchResults.clubs?.length && !searchResults.events?.length && !searchResults.users?.length && (
                  <p className="text-sm text-slate-400 text-center py-2">No results found</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user && (
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
                {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      <button onClick={async () => { await api.put('/notifications/read'); setNotifications(n => n.map(x => ({...x, is_read: true}))); }}
                        className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No notifications</p>
                      ) : notifications.slice(0, 10).map((n, i) => (
                        <div key={i} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}>
                          <p className="text-sm text-white">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="relative">
              <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors">
                <Avatar src={user.avatar} name={user.name} size="sm" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-white/5">
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.department}</p>
                    </div>
                    <div className="p-1">
                      <Link to={`/profile/${user.id}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/5">
            <div className="p-4 space-y-1">
              {navLinks.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className={`nav-link block ${location.pathname.startsWith(l.to) ? 'active' : ''}`}>{l.label}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
