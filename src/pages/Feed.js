import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image, Send, TrendingUp, Hash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, CardSkeleton, EmptyState, FadeIn } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const TAGS = ['#coding', '#dance', '#music', '#sports', '#art', '#tech', '#hackathon'];

function PostCard({ post, onLike, onSave }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const liked = user && post.likes?.includes(user.id);
  const saved = user && post.saved_by?.includes(user.id);

  const loadComments = async () => {
    if (!showComments) {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data);
    }
    setShowComments(s => !s);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const { data } = await api.post(`/posts/${post.id}/comment`, { content: comment });
    setComments(c => [...c, { ...data, name: user.name, avatar: user.avatar }]);
    setComment('');
  };

  return (
    <motion.div layout className="card">
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3">
          <Avatar src={post.user_avatar} name={post.user_name} size="md" />
          <div>
            <p className="font-semibold text-white text-sm">{post.user_name}</p>
            <p className="text-xs text-slate-400">
              {post.club_name && <span className="text-blue-400">{post.club_name} · </span>}
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {post.is_announcement && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">📢 Announcement</span>
        )}
      </div>

      <p className="text-slate-200 mb-4 leading-relaxed">{post.content}</p>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(t => (
            <span key={t} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">#{t}</span>
          ))}
        </div>
      )}

      {post.media?.length > 0 && (
        <div className={`grid gap-2 mb-4 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.media.map((m, i) => (
            <img key={i} src={m} alt="" className="w-full rounded-xl object-cover max-h-64" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <button onClick={() => onLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-400' : ''}`} />
          <span>{post.likes?.length || 0}</span>
        </button>
        <button onClick={loadComments} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length || 0}</span>
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/posts/' + post.id); toast.success('Link copied!'); }}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-green-400 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={() => onSave(post.id)} className={`ml-auto flex items-center gap-1.5 text-sm transition-colors ${saved ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`}>
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-yellow-400' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="pt-4 space-y-3">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <Avatar src={c.avatar} name={c.name} size="sm" />
                  <div className="glass rounded-xl px-3 py-2 flex-1">
                    <p className="text-xs font-semibold text-white">{c.name}</p>
                    <p className="text-sm text-slate-300">{c.content}</p>
                  </div>
                </div>
              ))}
              <form onSubmit={submitComment} className="flex gap-2">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input value={comment} onChange={e => setComment(e.target.value)}
                    placeholder="Write a comment..." className="input py-2 text-sm flex-1" />
                  <button type="submit" className="p-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreatePost({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('tags', tags);
      files.forEach(f => fd.append('media', f));
      const { data } = await api.post('/posts', fd);
      onPost({ ...data, user_name: user.name, user_avatar: user.avatar });
      setContent(''); setFiles([]); setTags('');
      toast.success('Posted! 🎉');
    } catch {
      toast.error('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.name} size="md" />
        <div className="flex-1">
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="input resize-none min-h-[80px] text-sm" />
          {files.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <button onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <label className="cursor-pointer p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Image className="w-4 h-4" />
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => setFiles(Array.from(e.target.files))} />
            </label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tags (comma separated)"
              className="input py-1.5 text-xs flex-1" />
            <button onClick={submit} disabled={loading || !content.trim()} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-3 h-3" /> Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, trendRes] = await Promise.all([
          api.get(`/posts${activeTag ? `?tag=${activeTag.replace('#', '')}` : ''}`),
          api.get('/posts/trending'),
        ]);
        setPosts(feedRes.data);
        setTrending(trendRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTag]);

  const handleLike = async (id) => {
    if (!user) return toast.error('Login to like');
    const { data } = await api.post(`/posts/${id}/like`);
    setPosts(ps => ps.map(p => p.id === id ? {
      ...p, likes: data.liked ? [...(p.likes || []), user.id] : (p.likes || []).filter(l => l !== user.id)
    } : p));
  };

  const handleSave = async (id) => {
    if (!user) return toast.error('Login to save');
    await api.post(`/posts/${id}/save`);
    toast.success('Saved!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button onClick={() => setActiveTag('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${!activeTag ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
              All
            </button>
            {TAGS.map(t => (
              <button key={t} onClick={() => setActiveTag(t === activeTag ? '' : t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTag === t ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>

          {user && <CreatePost onPost={p => setPosts(ps => [p, ...ps])} />}

          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : posts.length === 0 ? (
            <EmptyState icon="📭" title="No posts yet" desc="Be the first to post something!" />
          ) : (
            <div className="space-y-4">
              {posts.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <PostCard post={p} onLike={handleLike} onSave={handleSave} />
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">Trending Posts</h3>
            </div>
            <div className="space-y-3">
              {trending.slice(0, 5).map(p => (
                <div key={p.id} className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <Avatar src={p.user_avatar} name={p.user_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.content}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Heart className="w-3 h-3 text-red-400" /> {p.like_count || 0} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">Popular Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t} onClick={() => setActiveTag(t === activeTag ? '' : t)}
                  className={`text-sm px-3 py-1 rounded-full transition-all ${activeTag === t ? 'bg-blue-600 text-white' : 'glass text-blue-400 hover:bg-blue-500/20'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
