import { useEffect, useState } from 'react';
import { BarChart2, Users, BookOpen, Calendar, CheckCircle, XCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Spinner, FadeIn } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');
  const [pendingClubs, setPendingClubs] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/clubs/pending'),
      api.get('/admin/users'),
      api.get('/admin/join-requests'),
    ]).then(([s, c, u, jr]) => {
      setStats(s.data); setPendingClubs(c.data); setUsers(u.data); setJoinRequests(jr.data);
    }).finally(() => setLoading(false));
  }, [user, navigate]);

  const approveClub = async (id) => {
    await api.put(`/admin/clubs/${id}/approve`);
    setPendingClubs(c => c.filter(x => x.id !== id));
    toast.success('Club approved!');
  };

  const handleJoinRequest = async (id, action) => {
    try {
      await api.post(`/admin/join-requests/${id}`, { action });
      setJoinRequests(r => r.filter(x => x.id !== id));
      toast.success(action === 'approve' ? 'Member approved! ✅' : 'Request rejected');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    toast.success('Role updated!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.users, icon: Users, color: 'text-blue-400' },
    { label: 'Active Clubs', value: stats?.clubs, icon: BookOpen, color: 'text-green-400' },
    { label: 'Events', value: stats?.events, icon: Calendar, color: 'text-purple-400' },
    { label: 'Posts', value: stats?.posts, icon: BarChart2, color: 'text-yellow-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400">Manage your campus platform</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="card">
            <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-white">{s.value || 0}</p>
            <p className="text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['overview', 'pending clubs', 'join requests', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {t}
            {t === 'pending clubs' && pendingClubs.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingClubs.length}</span>}
            {t === 'join requests' && joinRequests.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{joinRequests.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'pending clubs' && (
        <FadeIn>
          {pendingClubs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No pending clubs</div>
          ) : (
            <div className="space-y-4">
              {pendingClubs.map(c => (
                <div key={c.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl">
                    {c.logo ? <img src={c.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : c.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-sm text-slate-400">{c.category} · by {c.creator_name}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{c.description}</p>
                  </div>
                  <button onClick={() => approveClub(c.id)} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      )}

      {tab === 'join requests' && (
        <FadeIn>
          {joinRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No pending join requests</div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map(r => (
                <div key={r.id} className="card flex items-center gap-4">
                  <Avatar src={r.avatar} name={r.user_name} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{r.user_name}</p>
                    <p className="text-xs text-slate-400">{r.department} · {r.year}</p>
                    <p className="text-sm text-blue-400 mt-1">Wants to join: <span className="font-medium text-white">{r.club_name}</span></p>
                    {r.message && <p className="text-sm text-slate-300 italic mt-1">"{r.message}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleJoinRequest(r.id, 'approve')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleJoinRequest(r.id, 'reject')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors text-sm font-medium">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      )}

      {tab === 'users' && (
        <FadeIn>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-3 text-slate-400 font-medium">User</th>
                  <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Department</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Role</th>
                  <th className="text-left p-3 text-slate-400 font-medium hidden lg:table-cell">Points</th>
                  <th className="text-left p-3 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-3 text-slate-300 hidden md:table-cell">{u.department}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === 'admin' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 hidden lg:table-cell">{u.points}</td>
                    <td className="p-3">
                      <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                        className="glass text-xs px-2 py-1 rounded-lg text-slate-300 border border-white/10">
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
