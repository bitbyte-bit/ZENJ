
import React from 'react';
import { 
  ArrowLeft, Palette, Bell, Smartphone, 
  Wallpaper, Trash2, ShieldAlert, Check, 
  ChevronRight, Circle
} from 'lucide-react';
import { UserProfile, AppSettings, Contact } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  contacts: Contact[];
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onUnblockContact: (id: string) => void;
  onClearData: () => void;
  onBack: () => void;
}

const THEMES = [
  { id: 'dark', label: 'Zen Dark', color: '#0b141a' },
  { id: 'zen-emerald', label: 'Zen Emerald', color: '#064e3b' },
  { id: 'zen-ocean', label: 'Zen Ocean', color: '#0c4a6e' },
];

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1518173946687-a4c8a9b746f5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=400&q=80',
  '' // None
];

const SettingsView: React.FC<SettingsViewProps> = ({ 
  profile, 
  contacts, 
  onUpdateSettings, 
  onUnblockContact, 
  onClearData, 
  onBack 
}) => {
  const blockedContacts = contacts.filter(c => c.isBlocked);
  const { settings } = profile;

  return (
    <div className="flex flex-col h-full bg-[#0b141a] animate-in slide-in-from-right duration-300">
      <header className="h-[60px] bg-[#202c33] flex items-center px-4 gap-4 shrink-0 shadow-lg z-10">
        <button onClick={onBack} className="text-[#d1d7db] hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-[#e9edef] text-lg font-medium">Settings</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 space-y-6">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Personalization */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-[#00a884] uppercase tracking-widest px-2">Personalization</h3>
            <div className="bg-[#111b21] rounded-[32px] overflow-hidden border border-white/5 divide-y divide-white/5">
              
              {/* Theme Selection */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4 text-[#e9edef]">
                  <Palette size={20} className="text-[#00a884]" />
                  <span className="font-medium">App Theme</span>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {THEMES.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id as any })}
                      className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all border-2 ${
                        settings.theme === t.id ? 'border-[#00a884] bg-[#00a884]/5' : 'border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full border border-white/10" style={{ backgroundColor: t.color }}></div>
                      <span className="text-[10px] text-[#d1d7db] whitespace-nowrap">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper Selection */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4 text-[#e9edef]">
                  <Wallpaper size={20} className="text-[#00a884]" />
                  <span className="font-medium">Chat Wallpaper</span>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                  {WALLPAPERS.map((wp, idx) => (
                    <button 
                      key={idx}
                      onClick={() => onUpdateSettings({ wallpaper: wp })}
                      className={`relative min-w-[70px] h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        settings.wallpaper === wp ? 'border-[#00a884]' : 'border-transparent'
                      }`}
                    >
                      {wp ? (
                        <img src={wp} className="w-full h-full object-cover" alt="Wallpaper option" />
                      ) : (
                        <div className="w-full h-full bg-[#0b141a] flex items-center justify-center text-[10px] text-[#8696a0]">None</div>
                      )}
                      {settings.wallpaper === wp && (
                        <div className="absolute inset-0 bg-[#00a884]/40 flex items-center justify-center">
                          <Check size={16} className="text-black" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Behavior */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-[#00a884] uppercase tracking-widest px-2">Behavior</h3>
            <div className="bg-[#111b21] rounded-[32px] overflow-hidden border border-white/5 divide-y divide-white/5">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#e9edef]">
                  <Bell size={20} className="text-[#00a884]" />
                  <span className="font-medium">In-app Notifications</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications} 
                  onChange={(e) => onUpdateSettings({ notifications: e.target.checked })}
                  className="w-5 h-5 accent-[#00a884]" 
                />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[#e9edef]">
                  <Smartphone size={20} className="text-[#00a884]" />
                  <span className="font-medium">Haptic Vibrations</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.vibrations} 
                  onChange={(e) => onUpdateSettings({ vibrations: e.target.checked })}
                  className="w-5 h-5 accent-[#00a884]" 
                />
              </div>
            </div>
          </section>

          {/* Blocked Contacts */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest px-2">Privacy & Blocking</h3>
            <div className="bg-[#111b21] rounded-[32px] overflow-hidden border border-white/5">
              {blockedContacts.length === 0 ? (
                <div className="p-8 text-center text-[#8696a0] text-sm">
                  <ShieldAlert size={32} className="mx-auto mb-2 opacity-20" />
                  No blocked contacts.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {blockedContacts.map(contact => (
                    <div key={contact.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={contact.avatar} className="w-10 h-10 rounded-full" alt={contact.name} />
                        <div>
                          <p className="text-[#e9edef] font-medium">{contact.name}</p>
                          <p className="text-xs text-[#8696a0]">{contact.phone}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onUnblockContact(contact.id)}
                        className="px-4 py-1.5 text-xs bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500/20 transition-all font-bold"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Data Management */}
          <section className="space-y-4">
            <div className="bg-rose-500/5 rounded-[32px] p-6 border border-rose-500/10 text-center">
              <h4 className="text-rose-500 font-bold mb-2">Danger Zone</h4>
              <p className="text-xs text-[#8696a0] mb-6">Resetting your data will erase all messages, contacts, and personalizations locally. This cannot be undone.</p>
              <button 
                onClick={onClearData}
                className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                <Trash2 size={20} />
                Erase Everything
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
