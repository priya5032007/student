import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Star, Calendar, MapPin, Award, UserPlus, UserMinus, CheckCircle, XCircle, Crown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Spinner, FadeIn } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');
  const [review, setReview] = useState({ rating: 5, review: '' });
  const [joining, setJoining] = useState(false);
  const [requests, setRequests] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get(`/clubs/${id}`).then(r => setClub(r.data)).finally(() => setLoading(false));
  }, [id]);

  const isMember = user && club?.members?.some(m => m.id === user.id);
  const isManager = user && (club?.created_by === user.id || roles.some(r => r.user_id === user.id && ['president', 'moderator'].includes(r.role)));

  useEffect(() => {
    if (!user || !club) return;
    api.get(`/clubs/${id}/roles`).then(r => setRoles(r.data)).catch(() => {});
  }, [id, user, club]);

  useEffect(() => {
    if (!isManager) return;
    api.get(`/clubs/${id}/requests`).then(r => setRequests(r.data)).catch(() => {});
  }, [id, isManager]);

  const getRoleLabel = (userId) => {
    const r = roles.find(r => r.user_id === userId);
    return r?.role || null;
  };

  const handleJoin = async () => {
    if (!user) return toast.error('Login to join');
    setJoining(true);
    try {
      const { data } = await api.post(`/clubs/${id}/join`);
      toast.success(data.joined ? 'Joined club! 🎉' : 'Left club');
      const res = await api.get(`/clubs/${id}`);
      setClub(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setJoining(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await api.post(`/clubs/${id}/requests/${requestId}`, { action });
      setRequests(r => r.filter(x => x.id !== requestId));
      toast.success(action === 'approve' ? 'Member approved! ✅' : 'Request rejected');
      if (action === 'approve') {
        const res = await api.get(`/clubs/${id}`);
        setClub(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      await api.post(`/clubs/${id}/members/${userId}/role`, { role });
      setRoles(prev => {
        const exists = prev.find(r => r.user_id === userId);
        if (exists) return prev.map(r => r.user_id === userId ? { ...r, role } : r);
        return [...prev, { user_id: userId, role }];
      });
      toast.success(`Role updated to ${role} 👑`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/clubs/${id}/members/${userId}`);
      const res = await api.get(`/clubs/${id}`);
      setClub(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clubs/${id}/review`, review);
      toast.success('Review submitted!');
      const res = await api.get(`/clubs/${id}`);
      setClub(res.data);
    } catch {
      toast.error('Failed to submit review');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  if (!club) return <div className="text-center pt-32 text-slate-400">Club not found</div>;

  const TABS = ['about', 'members', 'events', 'reviews', ...(isManager ? ['requests'] : [])];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">
      <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
        {club.banner ? (
          <img src={club.banner} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center text-8xl">🏛️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-navy-800 border-2 border-white/10 flex items-center justify-center text-3xl overflow-hidden">
            {club.logo ? <img src={club.logo} alt="" className="w-full h-full object-cover" /> : club.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{club.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge text={club.category} color="blue" />
              <span className="flex items-center gap-1 text-sm text-slate-300"><Users className="w-3 h-3" /> {club.members?.length || 0} members</span>
              <span className="flex items-center gap-1 text-sm text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" /> {parseFloat(club.rating || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isManager && requests.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">{requests.length} pending</span>
          )}
          <button onClick={handleJoin} disabled={joining}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
              isMember ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'btn-primary'}`}>
            {joining ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
              isMember ? <><UserMinus className="w-4 h-4" /> Leave</> : <><UserPlus className="w-4 h-4" /> Join Club</>}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {t} {t === 'requests' && requests.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed">{club.description || 'No description provided.'}</p>
              {club.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {club.tags.map(t => <Badge key={t} text={`#${t}`} color="purple" />)}
                </div>
              )}
              {club.achievements?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Achievements</h3>
                  <ul className="space-y-2">
                    {club.achievements.map((a, i) => <li key={i} className="text-slate-300 text-sm flex items-center gap-2">🏆 {a}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-white mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Members</span><span className="text-white">{club.members?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Events</span><span className="text-white">{club.events?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Rating</span><span className="text-yellow-400">{parseFloat(club.rating || 0).toFixed(1)} ⭐</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Reviews</span><span className="text-white">{club.review_count || 0}</span></div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {tab === 'members' && (
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {club.members?.map(m => {
              const role = getRoleLabel(m.id);
              const isPresident = user?.id === club.created_by || roles.find(r => r.user_id === user?.id)?.role === 'president';
              return (
                <div key={m.id} className="card flex flex-col items-center text-center p-4 hover:border-blue-500/30 transition-colors relative">
                  {role === 'president' && <Crown className="absolute top-3 right-3 w-4 h-4 text-yellow-400" />}
                  {role === 'moderator' && <Shield className="absolute top-3 right-3 w-4 h-4 text-blue-400" />}
                  <Link to={`/profile/${m.id}`}>
                    <Avatar src={m.avatar} name={m.name} size="lg" />
                    <p className="font-medium text-white mt-3 text-sm">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.department}</p>
                    {role && <span className={`text-xs mt-1 px-2 py-0.5 rounded-full ${role === 'president' ? 'bg-yellow-500/20 text-yellow-400' : role === 'moderator' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>{role}</span>}
                  </Link>
                  {isPresident && user?.id !== m.id && (
                    <div className="mt-3 flex gap-1 w-full">
                      <select onChange={e => e.target.value && handleAssignRole(m.id, e.target.value)}
                        defaultValue=""
                        className="flex-1 glass text-xs px-2 py-1 rounded-lg text-slate-300 border border-white/10">
                        <option value="" disabled>Role</option>
                        <option value="president">President</option>
                        <option value="moderator">Moderator</option>
                        <option value="member">Member</option>
                      </select>
                      <button onClick={() => handleRemoveMember(m.id)}
                        className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {tab === 'events' && (
        <FadeIn>
          <div className="space-y-4">
            {club.events?.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No events yet</div>
            ) : club.events?.map(e => (
              <Link key={e.id} to={`/events/${e.id}`} className="card flex gap-4 hover:border-blue-500/30 transition-colors">
                {e.poster && <img src={e.poster} alt={e.title} className="w-20 h-20 rounded-xl object-cover" />}
                <div>
                  <h3 className="font-semibold text-white">{e.title}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" /> {format(new Date(e.date), 'PPP')}</p>
                  <p className="text-sm text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      )}

      {tab === 'reviews' && (
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {club.reviews?.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={r.avatar} name={r.name} size="sm" />
                    <div>
                      <p className="font-medium text-white text-sm">{r.name}</p>
                      <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{r.review}</p>
                </div>
              ))}
            </div>
            {user && (
              <div className="card">
                <h3 className="font-semibold text-white mb-4">Write a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button" onClick={() => setReview(r => ({...r, rating: n}))}>
                          <Star className={`w-6 h-6 transition-colors ${n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={review.review} onChange={e => setReview(r => ({...r, review: e.target.value}))}
                    placeholder="Share your experience..." className="input resize-none h-24" />
                  <button type="submit" className="btn-primary w-full">Submit Review</button>
                </form>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {tab === 'requests' && isManager && (
        <FadeIn>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No pending requests</div>
          ) : (
            <div className="space-y-4">
              {requests.map(r => (
                <div key={r.id} className="card flex items-center gap-4">
                  <Avatar src={r.avatar} name={r.name} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.department} · {r.year}</p>
                    {r.message && <p className="text-sm text-slate-300 mt-1 italic">"{r.message}"</p>}
                    <p className="text-xs text-slate-500 mt-1">{format(new Date(r.created_at), 'PPP')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(r.id, 'approve')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => handleRequest(r.id, 'reject')}
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
    </div>
  );
}
