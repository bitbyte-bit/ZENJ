
import React, { useState, useRef } from 'react';
import { Plus, Camera, Send, X, Clock, Image as ImageIcon, Smile } from 'lucide-react';
import { Moment, UserProfile } from '../types';

interface StatusViewProps {
  moments: Moment[];
  onAddMoment: (content: string, mediaUrl?: string) => void;
  userProfile: UserProfile;
}

const StatusView: React.FC<StatusViewProps> = ({ moments, onAddMoment, userProfile }) => {
  const [isPosting, setIsPosting] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!content.trim() && !mediaUrl) return;
    onAddMoment(content, mediaUrl || undefined);
    setContent('');
    setMediaUrl(null);
    setIsPosting(false);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] animate-in fade-in duration-300 overflow-hidden">
      <header className="h-[60px] bg-[#202c33] flex items-center px-4 shrink-0 shadow-lg">
        <h2 className="text-[#e9edef] text-xl font-bold font-outfit">Zen Moments</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* My Status Trigger */}
          <div 
            onClick={() => setIsPosting(true)}
            className="flex items-center gap-4 p-4 bg-[#202c33] rounded-2xl cursor-pointer hover:bg-[#2a3942] transition-colors border border-white/5"
          >
            <div className="relative">
              <img src={userProfile.avatar} alt="Me" className="w-14 h-14 rounded-full border-2 border-[#00a884] object-cover" />
              <div className="absolute bottom-0 right-0 bg-[#00a884] text-white rounded-full p-0.5 border-2 border-[#202c33]">
                <Plus size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-[#e9edef] font-medium">My Status</h3>
              <p className="text-[#8696a0] text-sm">Tap to add a moment</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[#00a884] text-xs font-bold uppercase tracking-widest px-2">Recent Updates</h4>
            {moments.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <Clock size={48} className="mx-auto mb-4 text-[#8696a0]" />
                <p className="text-[#8696a0]">No moments to show</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {moments.map(moment => (
                  <div key={moment.id} className="bg-[#202c33] rounded-2xl overflow-hidden border border-white/5 shadow-xl group">
                    {moment.mediaUrl && (
                      <div className="aspect-[4/3] w-full overflow-hidden">
                        <img src={moment.mediaUrl} alt="Moment" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={moment.userAvatar} className="w-8 h-8 rounded-full border border-white/10" alt={moment.userName} />
                        <div>
                          <p className="text-[#e9edef] text-sm font-semibold">{moment.userName}</p>
                          <p className="text-[#8696a0] text-[10px]">{formatTime(moment.timestamp)}</p>
                        </div>
                      </div>
                      <p className="text-[#d1d7db] text-sm leading-relaxed">{moment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posting Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
          <button 
            onClick={() => setIsPosting(false)}
            className="absolute top-6 right-6 text-[#8696a0] hover:text-white"
          >
            <X size={32} />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
            <div className="w-full bg-[#202c33] rounded-[40px] p-8 shadow-2xl border border-white/10 space-y-6">
              <div className="relative aspect-video w-full rounded-2xl bg-[#0b141a] border border-white/5 overflow-hidden flex items-center justify-center">
                {mediaUrl ? (
                  <>
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setMediaUrl(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-[#8696a0] hover:text-[#00a884] transition-colors"
                  >
                    <Camera size={48} />
                    <span className="text-sm font-medium">Add Photo</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent border-none focus:ring-0 text-[#e9edef] text-xl placeholder-[#3b4a54] text-center h-24 resize-none"
              />

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex gap-4 text-[#8696a0]">
                  <ImageIcon size={24} className="cursor-pointer hover:text-white" onClick={() => fileInputRef.current?.click()} />
                  <Smile size={24} className="cursor-pointer hover:text-white" />
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!content.trim() && !mediaUrl}
                  className="bg-[#00a884] text-black px-10 py-3 rounded-full font-bold shadow-lg shadow-[#00a884]/20 hover:scale-105 transition-all disabled:opacity-50"
                >
                  Post Moment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusView;
