
import React, { useRef, useState } from 'react';
import { Camera, Share2, Save, ArrowLeft, User, Phone, Info, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate, onBack }) => {
  const [edited, setEdited] = useState(profile);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEdited({ ...edited, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(edited);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Zenj Profile: ${profile.name}`,
        text: profile.bio,
        url: window.location.href
      });
    } catch (e) {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] animate-in slide-in-from-right duration-300">
      <header className="h-[60px] md:h-[110px] bg-[#202c33] flex items-end px-4 pb-4 md:pb-6 gap-6 shrink-0">
        <button onClick={onBack} className="text-[#d1d7db] mb-1">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[#e9edef] text-lg font-medium mb-1">Profile</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar py-8">
        <div className="max-w-md mx-auto px-6 space-y-10">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={edited.avatar} 
                alt="User Avatar" 
                className="w-48 h-48 rounded-full object-cover border-4 border-[#202c33] shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white mb-1" size={32} />
                <span className="text-white text-xs font-medium uppercase">Change photo</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[#00a884] text-sm flex items-center gap-2">
                <User size={16} /> Your name
              </label>
              <input 
                type="text"
                value={edited.name}
                onChange={(e) => setEdited({...edited, name: e.target.value})}
                className="w-full bg-transparent border-b border-[#3b4a54] py-2 text-[#d1d7db] focus:border-[#00a884] outline-none transition-colors"
              />
              <p className="text-[#8696a0] text-xs">This is not your username or pin. This name will be visible to your Zenj contacts.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[#00a884] text-sm flex items-center gap-2">
                <Phone size={16} /> Phone number
              </label>
              <input 
                type="text"
                value={edited.phone}
                onChange={(e) => setEdited({...edited, phone: e.target.value})}
                placeholder="+1 234 567 890"
                className="w-full bg-transparent border-b border-[#3b4a54] py-2 text-[#d1d7db] focus:border-[#00a884] outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#00a884] text-sm flex items-center gap-2">
                <Info size={16} /> About
              </label>
              <textarea 
                value={edited.bio}
                onChange={(e) => setEdited({...edited, bio: e.target.value})}
                className="w-full bg-transparent border-b border-[#3b4a54] py-2 text-[#d1d7db] focus:border-[#00a884] outline-none transition-colors resize-none"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                saved ? 'bg-[#00a884] text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {saved ? <Check size={20} /> : <Save size={20} />}
              {saved ? 'Saved' : 'Save Profile'}
            </button>
            <button 
              onClick={handleShare}
              className="px-6 py-3 bg-[#202c33] text-[#d1d7db] rounded-xl hover:bg-[#2a3942] transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
