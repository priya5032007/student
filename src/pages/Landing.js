import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Calendar, Star, ChevronLeft, ChevronRight, Play, Zap, Globe } from 'lucide-react';
import { SlideIn, ScaleIn, HoverCard, Avatar } from '../components/ui';
import api from '../utils/api';

const TESTIMONIALS = [
  { name: 'Priya Sharma', dept: 'Computer Science', text: 'CampusConnect helped me find my tribe! Joined the coding club and made lifelong friends.', avatar: '' },
  { name: 'Rahul Verma', dept: 'Mechanical Eng', text: 'The event platform is amazing. Registered for 5 hackathons in one click!', avatar: '' },
  { name: 'Ananya Singh', dept: 'Arts & Design', text: 'Found the dance club through recommendations. Best decision of my college life!', avatar: '' },
];

const FEATURES = [
  { icon: '🎯', title: 'Smart Recommendations', desc: 'AI-powered club suggestions based on your interests' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Connect with club members instantly' },
  { icon: '🏆', title: 'Leaderboard', desc: 'Earn points and climb the ranks' },
  { icon: '📅', title: 'Event Platform', desc: 'BookMyShow-style event registration' },
];

export default function Landing() {
  const [stats, setStats] = useState({ students: 0, clubs: 0 });
  const [trending, setTrending] = useState([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/clubs/trending').then(r => setTrending(r.data)).catch(() => {});
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const visibleClubs = trending.slice(carouselIdx, carouselIdx + 3);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 50%)',
          }} />
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-40"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-blue-400 mb-6 border border-blue-500/20">
              <Zap className="w-3 h-3" /> Your Campus Social Network
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Connect. Explore.{' '}
              <span className="gradient-text">Belong.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Discover clubs, attend events, and build your campus community — all in one beautiful platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3 glow-blue">
                Join Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/clubs" className="btn-ghost flex items-center gap-2 text-base px-8 py-3">
                <Play className="w-4 h-4" /> Explore Clubs
              </Link>
              <Link to="/register" className="glass border border-purple-500/30 text-purple-400 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all hover:bg-purple-500/10 text-base">
                Create Club
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 flex items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-4xl font-black gradient-text">{stats.clubs}+</div>
              <div className="text-slate-400 text-sm mt-1">Active Clubs</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-4xl font-black gradient-text">{stats.students}+</div>
              <div className="text-slate-400 text-sm mt-1">Students</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-4xl font-black gradient-text">50+</div>
              <div className="text-slate-400 text-sm mt-1">Events/Month</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-blue-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SlideIn direction="up" className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-slate-400 text-lg">A complete campus social platform</p>
          </SlideIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <ScaleIn key={f.title} delay={i * 0.1}>
                <HoverCard>
                  <div className="card text-center group cursor-default">
                    <div className="text-4xl mb-4">{f.icon}</div>
                    <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm">{f.desc}</p>
                  </div>
                </HoverCard>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Clubs Carousel */}
      {trending.length > 0 && (
        <section className="py-24 px-4 bg-navy-900/50">
          <div className="max-w-6xl mx-auto">
            <SlideIn direction="up" className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">🔥 Trending Clubs</h2>
                <p className="text-slate-400">Most popular clubs this week</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))}
                  className="p-2 glass rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCarouselIdx(Math.min(trending.length - 3, carouselIdx + 1))}
                  className="p-2 glass rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </SlideIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {visibleClubs.map((club, i) => (
                  <motion.div key={club.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.1 }}>
                    <HoverCard>
                      <Link to={`/clubs/${club.id}`} className="card block overflow-hidden group">
                        <div className="h-32 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative">
                          {club.banner ? (
                            <img src={club.banner} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">🏛️</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-lg">
                            {club.logo ? <img src={club.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : club.name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{club.name}</h3>
                            <p className="text-xs text-slate-400">{club.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.members?.length || 0} members</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {parseFloat(club.rating || 0).toFixed(1)}</span>
                        </div>
                      </Link>
                    </HoverCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SlideIn direction="up">
            <h2 className="text-4xl font-bold text-white mb-16">What students say</h2>
          </SlideIn>
          <AnimatePresence mode="wait">
            <motion.div key={testimonialIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
              className="card p-8 glow-blue">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-lg text-slate-300 mb-6 italic">"{TESTIMONIALS[testimonialIdx].text}"</p>
              <div className="flex items-center justify-center gap-3">
                <Avatar name={TESTIMONIALS[testimonialIdx].name} size="md" />
                <div className="text-left">
                  <p className="font-semibold text-white">{TESTIMONIALS[testimonialIdx].name}</p>
                  <p className="text-sm text-slate-400">{TESTIMONIALS[testimonialIdx].dept}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-blue-500 w-6' : 'bg-slate-600'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <ScaleIn>
            <div className="card p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
              <div className="relative z-10">
                <Globe className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                <h2 className="text-4xl font-bold text-white mb-4">Ready to connect?</h2>
                <p className="text-slate-400 text-lg mb-8">Join thousands of students already on CampusConnect</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/clubs" className="btn-ghost text-base px-8 py-3">Browse Clubs</Link>
                </div>
              </div>
            </div>
          </ScaleIn>
        </div>
      </section>
    </div>
  );
}
