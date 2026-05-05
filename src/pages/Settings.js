import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Shield, Moon, Sun, LogOut } from 'lucide-react';
import { Avatar } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', department: user?.department || '', year: user?.year || '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      setUser(u => ({ ...u, ...data }));
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    toast.success('Password change coming soon!');
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: dark ? Moon : Sun },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
            <button onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="flex-1">
          {tab === 'profile' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-white">Edit Profile</h2>
              <div className="flex items-center gap-4">
                <Avatar src={user?.avatar} name={user?.name} size="lg" />
                <label className="btn-ghost text-sm py-2 px-4 cursor-pointer">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const fd = new FormData(); fd.append('avatar', e.target.files[0]);
                    const { data } = await api.put('/users/me', fd);
                    setUser(u => ({...u, avatar: data.avatar}));
                    toast.success('Avatar updated!');
                  }} />
                </label>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Full Name</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Bio</label>
                <textarea className="input resize-none h-20" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell us about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Department</label>
                  <input className="input" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Year</label>
                  <input className="input" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} />
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary px-6 py-2.5 flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-white">Change Password</h2>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Current Password</label>
                <input type="password" className="input" value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">New Password</label>
                <input type="password" className="input" value={passwords.new} onChange={e => setPasswords(p => ({...p, new: e.target.value}))} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Confirm New Password</label>
                <input type="password" className="input" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} />
              </div>
              <button onClick={changePassword} className="btn-primary px-6 py-2.5">Update Password</button>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="card space-y-5">
              <h2 className="font-semibold text-white">Appearance</h2>
              <div className="flex items-center justify-between p-4 glass rounded-xl">
                <div className="flex items-center gap-3">
                  {dark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                  <div>
                    <p className="font-medium text-white">{dark ? 'Dark Mode' : 'Light Mode'}</p>
                    <p className="text-sm text-slate-400">Toggle theme</p>
                  </div>
                </div>
                <button onClick={toggle} className={`w-12 h-6 rounded-full transition-all ${dark ? 'bg-blue-600' : 'bg-slate-600'} relative`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${dark ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
