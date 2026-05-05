import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tech', 'Sports', 'Arts', 'Music', 'Dance', 'Social', 'Academic', 'Other'];

const CATEGORY_ICONS = {
  Tech: '💻', Sports: '⚽', Arts: '🎨', Music: '🎵',
  Dance: '💃', Social: '👥', Academic: '📚', Other: '✨'
};

export default function CreateClub() {
  const [form, setForm] = useState({ name: '', description: '', category: '', tags: '' });
  const [customCategory, setCustomCategory] = useState('');
  const [banner, setBanner] = useState(null);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      const finalCategory = form.category === 'Other' && customCategory.trim()
        ? customCategory.trim()
        : form.category;
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('category', finalCategory);
      fd.append('tags', form.tags);
      if (banner) fd.append('banner', banner);
      if (logo) fd.append('logo', logo);
      const { data } = await api.post('/clubs', fd);
      toast.success('Club created! Pending approval 🎉');
      navigate(`/clubs/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const FileUpload = ({ label, file, setFile }) => (
    <div>
      <label className="text-sm text-slate-400 mb-2 block">{label}</label>
      {file ? (
        <div className="relative inline-block">
          <img src={URL.createObjectURL(file)} alt="" className="h-24 rounded-xl object-cover" />
          <button type="button" onClick={() => setFile(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-24 glass rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-slate-500 mb-1" />
          <span className="text-xs text-slate-500">Click to upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-white mb-2">Create a Club</h1>
      <p className="text-slate-400 mb-8">Build your campus community</p>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FileUpload label="Club Banner" file={banner} setFile={setBanner} />
          <FileUpload label="Club Logo" file={logo} setFile={setLogo} />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Club Name *</label>
          <input className="input" placeholder="e.g. Coding Club" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Description</label>
          <textarea className="input resize-none h-24" placeholder="What is your club about?"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Category *</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {CATEGORIES.map(c => (
              <button key={c} type="button"
                onClick={() => { setForm(f => ({ ...f, category: c })); setCustomCategory(''); }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all border ${
                  form.category === c
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'glass text-slate-400 hover:text-white border-white/10 hover:border-blue-500/30'
                }`}>
                <span className="text-lg">{CATEGORY_ICONS[c]}</span>
                {c}
              </button>
            ))}
          </div>
          {form.category === 'Other' && (
            <input className="input" placeholder="Enter your custom category name..."
              value={customCategory} onChange={e => setCustomCategory(e.target.value)} required />
          )}
          {!form.category && (
            <p className="text-xs text-red-400 mt-1">Please select a category</p>
          )}
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Tags (comma separated)</label>
          <input className="input" placeholder="coding, python, web" value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        </div>

        <button type="submit" disabled={loading || !form.category}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Create Club'}
        </button>
      </form>
    </div>
  );
}
