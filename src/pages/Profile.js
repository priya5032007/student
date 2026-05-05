import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { UserPlus, UserMinus, Award, Download, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, Spinner, FadeIn } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');
  const [following, setFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const isMe = user?.id === id;

  useEffect(() => {
    api.get(`/users/${id}`).then(r => {
      setProfile(r.data);
      setFollowing(r.data.followers?.includes(user?.id));
      setEditForm({ name: r.data.name, bio: r.data.bio, department: r.data.department, year: r.data.year });
    }).finally(() => setLoading(false));
  }, [id, user?.id]);

  const handleFollow = async () => {
    if (!user) return toast.error('Login to follow');
    const { data } = await api.post(`/users/${id}/follow`);
    setFollowing(data.following);
    setProfile(p => ({
      ...p,
      followers: data.following ? [...(p.followers || []), user.id] : (p.followers || []).filter(f => f !== user.id)
    }));
  };

  const handleEditSave = async () => {
    try {
      const { data } = await api.put('/users/me', editForm);
      setProfile(p => ({ ...p, ...data }));
      setUser(u => ({ ...u, ...data }));
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    }
  };

  const BADGE_ICONS = { 'Leader': '🥇', 'Active Member': '🔥', 'Event Star': '⭐', 'Contributor': '💡' };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  if (!profile) return <div className="text-center pt-32 text-slate-400">User not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">
      <div className="relative h-48 rounded-2xl overflow-hidden mb-0">
        {profile.cover_image ? (
          <img src={profile.cover_image} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-navy-800" />
        )}
      </div>

      <div className="relative px-6 pb-6 glass rounded-b-2xl border border-white/5 border-t-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-6">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar src={profile.avatar} name={profile.name} size="xl" />
              {isMe && (
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const fd = new FormData(); fd.append('avatar', e.target.files[0]);
                    const { data } = await api.put('/users/me', fd);
                    setProfile(p => ({...p, avatar: data.avatar}));
                    setUser(u => ({...u, avatar: data.avatar}));
                    toast.success('Avatar updated!');
                  }} />
                </label>
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-slate-400 text-sm">{profile.department} · {profile.year}</p>
            </div>
          </div>
          <div className="flex gap-2 mb-2">
            {isMe ? (
              <button onClick={() => setEditing(e => !e)} className="btn-ghost py-2 px-4 text-sm">
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <button onClick={handleFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${following ? 'glass text-slate-300 hover:text-red-400' : 'btn-primary'}`}>
                {following ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 mb-6">
            <input className="input" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({...f, name: e.target.value}))} />
            <textarea className="input resize-none h-20" placeholder="Bio" value={editForm.bio} onChange={e => setEditForm(f => ({...f, bio: e.target.value}))} />
            <div className="flex gap-3">
              <input className="input" placeholder="Department" value={editForm.department} onChange={e => setEditForm(f => ({...f, department: e.target.value}))} />
              <input className="input" placeholder="Year" value={editForm.year} onChange={e => setEditForm(f => ({...f, year: e.target.value}))} />
            </div>
            <button onClick={handleEditSave} className="btn-primary px-6 py-2 text-sm">Save Changes</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="text-center"><p className="text-xl font-bold text-white">{profile.followers?.length || 0}</p><p className="text-xs text-slate-400">Followers</p></div>
            <div className="text-center"><p className="text-xl font-bold text-white">{profile.following?.length || 0}</p><p className="text-xs text-slate-400">Following</p></div>
            <div className="text-center"><p className="text-xl font-bold text-white">{profile.points || 0}</p><p className="text-xs text-slate-400">Points</p></div>
            <div className="text-center"><p className="text-xl font-bold text-white">{profile.clubs?.length || 0}</p><p className="text-xs text-slate-400">Clubs</p></div>
          </div>
        )}

        {profile.bio && !editing && <p className="text-slate-300 mb-4">{profile.bio}</p>}

        {profile.badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.badges.map(b => (
              <span key={b} className="glass px-3 py-1 rounded-full text-sm text-yellow-400 border border-yellow-500/20">
                {BADGE_ICONS[b] || '🏅'} {b}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6 mb-6 overflow-x-auto pb-2">
        {['clubs', 'certificates'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'clubs' && (
        <FadeIn>
          {profile.clubs?.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Not a member of any clubs yet</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.clubs?.map(c => (
                <Link key={c.id} to={`/clubs/${c.id}`} className="card flex flex-col items-center text-center p-4 hover:border-blue-500/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-xl mb-3">
                    {c.logo ? <img src={c.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : c.name[0]}
                  </div>
                  <p className="font-medium text-white text-sm">{c.name}</p>
                  <Badge text={c.category} color="blue" />
                </Link>
              ))}
            </div>
          )}
        </FadeIn>
      )}

      {tab === 'certificates' && (
        <FadeIn>
          {profile.certificates?.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No certificates yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.certificates?.map(c => (
                <div key={c.id} className="card flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{c.title}</p>
                    <p className="text-sm text-slate-400">{c.event_title}</p>
                  </div>
                  <button className="p-2 glass rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      )}
    </div>
  );
}
