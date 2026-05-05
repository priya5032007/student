import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, Spinner, FadeIn } from '../components/ui';
import api from '../utils/api';

const RANK_STYLES = [
  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'bg-slate-400/20 text-slate-300 border-slate-400/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30',
];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      <div className="text-center mb-12">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-slate-400">Top active students this month</p>
      </div>

      <div className="flex items-end justify-center gap-4 mb-12">
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((u, i) => {
          const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
          const heights = ['h-28', 'h-36', 'h-24'];
          const icons = [<Medal className="w-5 h-5" />, <Trophy className="w-6 h-6" />, <Award className="w-5 h-5" />];
          return (
            <FadeIn key={u.id} delay={i * 0.1} className="flex flex-col items-center">
              <Link to={`/profile/${u.id}`} className="flex flex-col items-center mb-3">
                <Avatar src={u.avatar} name={u.name} size={rank === 1 ? 'xl' : 'lg'} />
                <p className="font-semibold text-white text-sm mt-2">{u.name}</p>
                <p className="text-xs text-slate-400">{u.department}</p>
                <p className="text-blue-400 font-bold text-sm mt-1">{u.points} pts</p>
              </Link>
              <div className={`w-24 ${heights[i]} glass rounded-t-xl flex items-start justify-center pt-3 border ${RANK_STYLES[rank - 1]}`}>
                <span className="flex items-center gap-1 font-bold">{icons[i]} #{rank}</span>
              </div>
            </FadeIn>
          );
        })}
      </div>

      <div className="space-y-3">
        {rest.map((u, i) => (
          <FadeIn key={u.id} delay={i * 0.05}>
            <Link to={`/profile/${u.id}`} className="card flex items-center gap-4 hover:border-blue-500/30 transition-colors">
              <span className="text-slate-500 font-bold w-6 text-center text-sm">#{i + 4}</span>
              <Avatar src={u.avatar} name={u.name} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-white">{u.name}</p>
                <p className="text-sm text-slate-400">{u.department}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-400">{u.points}</p>
                <p className="text-xs text-slate-500">points</p>
              </div>
              {u.badges?.length > 0 && (
                <div className="flex gap-1">
                  {u.badges.slice(0, 2).map(b => <span key={b} className="text-sm" title={b}>🏅</span>)}
                </div>
              )}
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
