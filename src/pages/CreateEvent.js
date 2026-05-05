import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const [form, setForm] = useState({ title: '', description: '', location: '', date: '', capacity: 100, tags: '', club_id: '' });
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'club_id' && (!v || v.trim() === '')) return;
        fd.append(k, v);
      });
      if (poster) fd.append('poster', poster);
      const { data } = await api.post('/events', fd);
      toast.success('Event created! 🎉');
      navigate(`/events/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-white mb-2">Create Event</h1>
      <p className="text-slate-400 mb-8">Host an amazing campus event</p>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Event Poster</label>
          {poster ? (
            <div className="relative inline-block">
              <img src={URL.createObjectURL(poster)} alt="" className="h-32 rounded-xl object-cover" />
              <button type="button" onClick={() => setPoster(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 glass rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-slate-500 mb-2" />
              <span className="text-sm text-slate-500">Upload poster</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setPoster(e.target.files[0])} />
            </label>
          )}
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Event Title *</label>
          <input className="input" placeholder="e.g. Annual Hackathon 2024" value={form.title}
            onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Description</label>
          <textarea className="input resize-none h-24" placeholder="Describe your event..."
            value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Date & Time *</label>
            <input type="datetime-local" className="input" value={form.date}
              onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Capacity</label>
            <input type="number" className="input" value={form.capacity} min={1}
              onChange={e => setForm(f => ({...f, capacity: e.target.value}))} />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Location</label>
          <input className="input" placeholder="e.g. Main Auditorium" value={form.location}
            onChange={e => setForm(f => ({...f, location: e.target.value}))} />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Tags (comma separated)</label>
          <input className="input" placeholder="hackathon, coding, prizes" value={form.tags}
            onChange={e => setForm(f => ({...f, tags: e.target.value}))} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
