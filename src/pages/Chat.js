import { useEffect, useState, useRef } from 'react';
import { Send, Hash, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Avatar, Spinner } from '../components/ui';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
      <Avatar src={msg.avatar} name={msg.name} size="sm" />
      <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isMe && <p className="text-xs text-slate-400 mb-1">{msg.name}</p>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'glass text-slate-200 rounded-tl-sm'}`}>
          {msg.content}
        </div>
        <p className="text-xs text-slate-500 mt-1">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef();

  useEffect(() => {
    api.get('/chat/conversations').then(r => setConversations(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    api.get(`/chat/messages?with=${activeConv.id}`).then(r => setMessages(r.data));
    const room = [user.id, activeConv.id].sort().join('-');
    socket?.emit('join_room', room);
    socket?.on('new_message', (msg) => setMessages(m => [...m, msg]));
    socket?.on('typing', () => setTyping(true));
    socket?.on('stop_typing', () => setTyping(false));
    return () => { socket?.off('new_message'); socket?.off('typing'); socket?.off('stop_typing'); };
  }, [activeConv, socket, user?.id]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    const room = [user.id, activeConv.id].sort().join('-');
    socket?.emit('send_message', { sender_id: user.id, receiver_id: activeConv.id, content: input, room });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    const room = [user.id, activeConv?.id].sort().join('-');
    socket?.emit('typing', { room });
    clearTimeout(window._typingTimeout);
    window._typingTimeout = setTimeout(() => socket?.emit('stop_typing', { room }), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-4 h-screen flex flex-col">
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-72 flex-shrink-0 flex flex-col glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-400" /> Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex justify-center p-4"><Spinner /></div> :
              conversations.length === 0 ? <p className="text-slate-400 text-sm text-center p-4">No conversations yet</p> :
              conversations.map(c => (
                <button key={c.id} onClick={() => setActiveConv({ id: c.receiver_id === user.id ? c.sender_id : c.receiver_id, name: c.name, avatar: c.avatar })}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${activeConv?.id === (c.receiver_id === user.id ? c.sender_id : c.receiver_id) ? 'bg-blue-500/10' : ''}`}>
                  <div className="relative">
                    <Avatar src={c.avatar} name={c.name} size="sm" />
                    {onlineUsers.includes(c.receiver_id === user.id ? c.sender_id : c.receiver_id) && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-navy-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.content}</p>
                  </div>
                </button>
              ))
            }
          </div>
        </div>

        <div className="flex-1 flex flex-col glass rounded-2xl overflow-hidden">
          {activeConv ? (
            <>
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="relative">
                  <Avatar src={activeConv.avatar} name={activeConv.name} size="sm" />
                  {onlineUsers.includes(activeConv.id) && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-navy-900" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{activeConv.name}</p>
                  <p className="text-xs text-slate-400">{onlineUsers.includes(activeConv.id) ? '🟢 Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => <MessageBubble key={m.id} msg={m} isMe={m.sender_id === user.id} />)}
                {typing && (
                  <div className="flex gap-2">
                    <Avatar src={activeConv.avatar} name={activeConv.name} size="sm" />
                    <div className="glass px-4 py-2.5 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEnd} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-white/5 flex gap-2">
                <input value={input} onChange={handleTyping} placeholder="Type a message..."
                  className="input flex-1 py-2.5 text-sm" />
                <button type="submit" disabled={!input.trim()} className="p-2.5 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
