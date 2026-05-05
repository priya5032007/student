import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react';
import { HoverCard, CardSkeleton, EmptyState, Badge, FadeIn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format, isPast } from 'date-fns';

function CountdownTimer({ date }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) { setTime('Event started'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [date]);
  return <span className="text-xs text-blue-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>;
}

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get(`/events${search ? `?q=${search}` : ''}`).then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
          <p className="text-slate-400">Discover and register for campus events</p>
        </div>
        {user && (
          <Link to="/events/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
        className="input mb-6 max-w-md" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon="📅" title="No events found" desc="Check back later for upcoming events" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <FadeIn key={event.id} delay={i * 0.05}>
              <HoverCard>
                <Link to={`/events/${event.id}`} className="card block overflow-hidden group">
                  <div className="h-40 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative">
                    {event.poster ? (
                      <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🎯</div>
                    )}
                    {isPast(new Date(event.date)) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-red-500/80 px-3 py-1 rounded-full">Ended</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                  {event.club_name && <Badge text={event.club_name} color="blue" />}
                  <div className="space-y-1.5 mt-3">
                    <p className="text-sm text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {format(new Date(event.date), 'PPP')}
                    </p>
                    {event.location && (
                      <p className="text-sm text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </p>
                    )}
                    <p className="text-sm text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {event.registered_count}/{event.capacity} registered
                    </p>
                  </div>
                  {!isPast(new Date(event.date)) && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <CountdownTimer date={event.date} />
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (event.registered_count / event.capacity) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{event.capacity - event.registered_count} seats left</p>
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
