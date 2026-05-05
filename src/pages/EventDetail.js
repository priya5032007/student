import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Share2, CalendarPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge, Spinner, FadeIn } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then(r => setEvent(r.data)).finally(() => setLoading(false));
  }, [id]);

  const isRegistered = user && event?.registered_users?.includes(user.id);
  const isFull = event && event.registered_count >= event.capacity;

  const handleRegister = async () => {
    if (!user) return toast.error('Login to register');
    setRegistering(true);
    try {
      await api.post(`/events/${id}/register`);
      toast.success('Registered successfully! 🎉');
      setEvent(e => ({ ...e, registered_count: e.registered_count + 1, registered_users: [...(e.registered_users || []), user.id] }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const addToCalendar = () => {
    const start = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${start}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || '')}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  if (!event) return <div className="text-center pt-32 text-slate-400">Event not found</div>;

  const past = isPast(new Date(event.date));
  const fillPercent = Math.min(100, (event.registered_count / event.capacity) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-12">
      <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-72 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-purple-600/20 to-blue-600/20">
              {event.poster ? (
                <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🎯</div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{event.title}</h1>
            {event.club_name && <Badge text={event.club_name} color="blue" />}
            <p className="text-slate-300 mt-4 leading-relaxed">{event.description}</p>
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map(t => <Badge key={t} text={`#${t}`} color="purple" />)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-white mb-4">Event Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white">{format(new Date(event.date), 'PPPP')}</p>
                    <p className="text-slate-400">{format(new Date(event.date), 'p')}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-white">{event.location}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <p className="text-white">{event.registered_count} / {event.capacity} registered</p>
                </div>
                {!past && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-400">{formatDistanceToNow(new Date(event.date), { addSuffix: true })}</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${fillPercent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{event.capacity - event.registered_count} seats remaining</p>
              </div>

              {!past && (
                <button onClick={handleRegister} disabled={registering || isRegistered || isFull}
                  className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isRegistered ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    isFull ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'btn-primary'
                  }`}>
                  {registering ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                    isRegistered ? '✓ Registered' : isFull ? 'Event Full' : '🎟️ Register Now'}
                </button>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={addToCalendar} className="flex-1 btn-ghost py-2 text-sm flex items-center justify-center gap-1.5">
                  <CalendarPlus className="w-3 h-3" /> Add to Calendar
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="flex-1 btn-ghost py-2 text-sm flex items-center justify-center gap-1.5">
                  <Share2 className="w-3 h-3" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
