
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  X,
  Loader2,
  Phone,
  Video,
  ArrowLeft,
  Trash2,
  Info,
  Users,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { Contact, Message, UserProfile } from '../types';
import MessageItem from './MessageItem';

interface ChatViewProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (content: string, imageUrl?: string, audioUrl?: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onBlockContact: (id: string) => void;
  onOpenGroupSettings: () => void;
  isTyping: boolean;
  onBack?: () => void;
  userProfile: UserProfile;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  contact, 
  messages, 
  onSendMessage, 
  onReactToMessage, 
  onStartCall, 
  onBlockContact,
  onOpenGroupSettings,
  isTyping, 
  onBack, 
  userProfile 
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    if (userProfile.settings.vibrations && navigator.vibrate) navigator.vibrate(50);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => onSendMessage('', undefined, reader.result as string);
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert('Could not access microphone');
    }
  };

  const stopRecording = (shouldSend: boolean) => {
    if (mediaRecorderRef.current && isRecording) {
      if (!shouldSend) mediaRecorderRef.current.onstop = () => {};
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isTyping) return;
    onSendMessage(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      {/* Header */}
      <header className="h-[60px] bg-[#202c33] px-3 flex items-center justify-between border-l border-[#222d34] shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-hidden">
          {onBack && <button onClick={onBack} className="text-[#d1d7db] mr-1"><ArrowLeft size={24} /></button>}
          <div 
            className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
            onClick={contact.isGroup ? onOpenGroupSettings : undefined}
          >
            <div className="relative flex-shrink-0">
              <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover" />
              {contact.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-[#00a884] text-black rounded-full p-0.5 border border-[#202c33]">
                  <Users size={10} />
                </div>
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[#e9edef] font-medium leading-tight group-hover:text-[#00a884] transition-colors truncate">
                {contact.hideDetails ? 'Zen Chat' : contact.name}
              </span>
              <span className="text-[12px] text-[#8696a0]">
                {isTyping ? <span className="text-[#00a884] animate-pulse">typing...</span> : (contact.isGroup ? `${contact.members?.length} members` : contact.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-[#aebac1]">
          {!contact.isGroup && (
            <>
              <Video size={22} className="cursor-pointer hover:text-white transition-colors" onClick={() => onStartCall('video')} />
              <Phone size={20} className="cursor-pointer hover:text-white transition-colors" onClick={() => onStartCall('audio')} />
            </>
          )}
          <div className="relative">
            <MoreVertical 
              size={20} 
              className={`cursor-pointer transition-colors ${showMenu ? 'text-white' : 'hover:text-white'}`} 
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a3942] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                {contact.isGroup && (
                  <button 
                    onClick={() => { onOpenGroupSettings(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                  >
                    <Settings size={16} /> Group Settings
                  </button>
                )}
                <button 
                  onClick={() => { onBlockContact(contact.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-3"
                >
                  <ShieldAlert size={16} /> Block Contact
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3">
                  <Trash2 size={16} /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Invite Pending Banner */}
      {contact.isInvitePlaceholder && (
        <div className="bg-orange-500/10 border-y border-orange-500/20 px-4 py-2 flex items-center gap-3 shrink-0 z-10">
          <Info size={18} className="text-orange-500" />
          <p className="text-xs text-orange-200">Invite Link Active. It will automatically expire once they register.</p>
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 custom-scrollbar z-0"
        style={{ 
          backgroundImage: userProfile.settings.wallpaper ? `url(${userProfile.settings.wallpaper})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-1">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              userName={userProfile.name} 
              onReact={(emoji) => onReactToMessage(msg.id, emoji)}
            />
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#202c33]/80 backdrop-blur-sm px-4 py-2 rounded-2xl text-[#00a884] text-xs font-bold flex items-center gap-3 border border-[#00a884]/20 animate-pulse shadow-lg">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce"></div>
                </div>
                Zen Thinking
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="min-h-[62px] bg-[#202c33] px-3 py-2 flex items-end gap-2 relative safe-bottom shrink-0 z-20">
        {isRecording ? (
          <div className="flex-1 flex items-center gap-4 py-2 animate-in slide-in-from-right duration-300">
            <Mic size={24} className="text-rose-500 animate-pulse" />
            <div className="flex-1 text-[#e9edef] font-mono text-lg">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</div>
            <button onClick={() => stopRecording(false)} className="p-3 text-[#8696a0] hover:text-rose-500"><Trash2 size={24} /></button>
            <button 
              onClick={() => {
                if (userProfile.settings.vibrations && navigator.vibrate) navigator.vibrate([10, 30, 10]);
                stopRecording(true);
              }} 
              className="bg-[#00a884] text-black p-3 rounded-full hover:bg-[#06cf9c]"
            >
              <Send size={24} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-[#8696a0] pb-2">
              <Smile size={24} className="cursor-pointer hover:text-[#d1d7db]" />
              <button onClick={() => fileInputRef.current?.click()} className="hover:text-[#d1d7db]"><Paperclip size={24} /></button>
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type a message" 
                className="w-full bg-[#2a3942] border-none focus:ring-0 rounded-2xl py-2 px-4 text-[#d1d7db] placeholder-[#8696a0] text-base" 
              />
              <button 
                type="submit" 
                disabled={isTyping} 
                className="bg-[#00a884] text-black p-3 rounded-full hover:bg-[#06cf9c] transition-colors disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </form>
            <button type="button" onClick={startRecording} className="bg-[#00a884] text-black p-3 rounded-full hover:bg-[#06cf9c] transition-colors mb-0.5"><Mic size={24} /></button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatView;
