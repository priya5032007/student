import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Plus, Search } from 'lucide-react';
import { HoverCard, CardSkeleton, EmptyState, Badge, FadeIn } from '../components/ui';
import api from '../utils/api';

const CATEGORIES = ['All', 'Tech', 'Sports', 'Arts', 'Music', 'Dance', 'Social', 'Academic', 'Other'];

const CATEGORY_ICONS = {
  All: '🌐', Tech: '💻', Sports: '⚽', Arts: '🎨', Music: '🎵',
  Dance: '💃', Social: '👥', Academic: '📚', Other: '✨'
};

export default function Clubs() {
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/clubs').then(r => setAllClubs(r.data)).finally(() => setLoading(false));
  }, []);

  // filter client-side so category buttons work instantly
  const filtered = allClubs.filter(club => {
    const matchCat = category === 'All' || club.category === category;
    const matchSearch = !search || club.name.toLowerCase().includes(search.toLowerCase()) || club.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Explore Clubs</h1>
          <p className="text-slate-400">Find your community · <span className="text-blue-400 font-medium">{filtered.length}</span> clubs found</p>
        </div>
        <Link to="/clubs/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Club
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs..." className="input pl-10" />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(c => {
          const count = c === 'All' ? allClubs.length : allClubs.filter(x => x.category === c).length;
          return (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === c
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : count === 0
                  ? 'glass text-slate-600 cursor-default opacity-50'
                  : 'glass text-slate-400 hover:text-white hover:border-blue-500/30'
              }`}>
              <span>{CATEGORY_ICONS[c]}</span>
              {c}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${category === c ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CATEGORY_ICONS[category] || '🏛️'}
          title={`No ${category === 'All' ? '' : category} clubs found`}
          desc={search ? `No results for "${search}"` : 'Be the first to create one!'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club, i) => (
            <FadeIn key={club.id} delay={i * 0.05}>
              <HoverCard>
                <Link to={`/clubs/${club.id}`} className="card block overflow-hidden group">
                  <div className="h-32 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                    {club.banner ? (
                      <img src={club.banner} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {CATEGORY_ICONS[club.category] || '🏛️'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-lg overflow-hidden">
                      {club.logo ? <img src={club.logo} alt="" className="w-full h-full object-cover" /> : club.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{club.name}</h3>
                      <Badge text={club.category} color="blue" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{club.description}</p>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.members?.length || 0} members</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {parseFloat(club.rating || 0).toFixed(1)}</span>
                  </div>
                </Link>
              </HoverCard>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
