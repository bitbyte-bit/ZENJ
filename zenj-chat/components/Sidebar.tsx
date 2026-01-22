
import React, { useState, useMemo } from 'react';
import { 
  MessageSquareText, 
  CircleDashed, 
  Sparkles, 
  Settings,
  Search,
  Filter,
  UserPlus,
  Users,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { Contact, AppMode, UserProfile, Message } from '../types';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (id: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  userProfile: UserProfile;
  onOpenAddFriend: () => void;
  onOpenCreateGroup: () => void;
  conversations: Record<string, Message[]>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  contacts, 
  activeContactId, 
  onSelectContact, 
  mode, 
  setMode, 
  userProfile,
  onOpenAddFriend,
  onOpenCreateGroup,
  conversations
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const visibleContacts = useMemo(() => {
    return contacts.filter(c => !c.isBlocked);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = visibleContacts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(contact => {
        if (contact.name.toLowerCase().includes(query)) return true;
        if (contact.phone?.toLowerCase().includes(query)) return true;
        const history = conversations[contact.id] || [];
        return history.some(msg => msg.type === 'text' && msg.content.toLowerCase().includes(query));
      });
    }
    // Sort by latest message
    return result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }, [visibleContacts, searchQuery, conversations]);

  const getDisplaySnippet = (contact: Contact) => {
    if (!searchQuery.trim()) return contact.lastMessageSnippet;
    const query = searchQuery.toLowerCase();
    const history = conversations[contact.id] || [];
    const matchingMsg = history.find(msg => msg.type === 'text' && msg.content.toLowerCase().includes(query));
    if (matchingMsg && !contact.name.toLowerCase().includes(query)) return `Found: "${matchingMsg.content}"`;
    return contact.lastMessageSnippet;
  };

  const totalUnread = useMemo(() => {
    return visibleContacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [visibleContacts]);

  return (
    <div className="h-full flex flex-col bg-[#111b21] border-r border-[#222d34] safe-top">
      {/* Header Tabs */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between shrink-0">
        <button onClick={() => setMode(AppMode.PROFILE)} className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:opacity-80 transition-opacity">
          <img src={userProfile.avatar} alt="Me" className="w-full h-full object-cover" />
        </button>
        <div className="flex items-center gap-4 md:gap-6 text-[#aebac1]">
          <CircleDashed size={22} className={`cursor-pointer hover:text-white ${mode === AppMode.STATUS ? 'text-[#00a884]' : ''}`} onClick={() => setMode(AppMode.STATUS)} />
          
          <div className="relative">
            <MessageSquareText size={22} className={`cursor-pointer hover:text-white ${mode === AppMode.CHATS ? 'text-[#00a884]' : ''}`} onClick={() => setMode(AppMode.CHATS)} />
            {totalUnread > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00a884] rounded-full flex items-center justify-center border-2 border-[#202c33]">
                <span className="text-[9px] text-black font-bold">{totalUnread}</span>
              </div>
            )}
          </div>

          <Sparkles size={22} className={`cursor-pointer hover:text-white ${mode === AppMode.ZEN_SPACE ? 'text-[#00a884]' : ''}`} onClick={() => setMode(AppMode.ZEN_SPACE)} />
          <UserPlus size={22} className={`cursor-pointer hover:text-white ${mode === AppMode.CONTACT_SYNC ? 'text-[#00a884]' : ''}`} onClick={() => setMode(AppMode.CONTACT_SYNC)} />
          <Settings size={22} className={`cursor-pointer hover:text-white ${mode === AppMode.SETTINGS ? 'text-[#00a884]' : ''}`} onClick={() => setMode(AppMode.SETTINGS)} />
        </div>
      </div>

      {mode === AppMode.CHATS && (
        <>
          <div className="p-3 flex items-center gap-2 shrink-0">
            <div className="flex-1 bg-[#202c33] rounded-xl flex items-center px-3 py-1.5 gap-4">
              <Search size={18} className={`${searchQuery ? 'text-[#00a884]' : 'text-[#8696a0]'}`} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chats" className="bg-transparent border-none focus:ring-0 text-sm text-[#d1d7db] placeholder-[#8696a0] w-full" />
            </div>
            {/* Fix: Added missing Plus icon import to button */}
            <button onClick={onOpenCreateGroup} className="p-2 bg-[#00a884]/10 text-[#00a884] rounded-lg hover:bg-[#00a884]/20 transition-all" title="New Group">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredContacts.map((contact) => (
              <div key={contact.id} onClick={() => onSelectContact(contact.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-[#222d34] ${activeContactId === contact.id ? 'bg-[#2a3942]' : ''}`}>
                <div className="relative flex-shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-white/5" />
                  {contact.status === 'online' && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>}
                  {contact.isGroup && <div className="absolute -bottom-1 -right-1 bg-[#2a3942] rounded-full p-0.5 border border-[#111b21]"><Users size={12} className="text-[#00a884]" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-[#e9edef] font-medium truncate flex items-center gap-1.5">
                      {contact.hideDetails ? 'Zen Group' : contact.name}
                      {contact.isGroup && <span className="text-[10px] text-[#00a884] uppercase tracking-tighter bg-[#00a884]/10 px-1 rounded">Group</span>}
                    </h3>
                    <span className="text-[11px] text-[#8696a0]">{new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#8696a0] truncate leading-tight flex-1">
                      {contact.hideDetails ? 'Message protected by Zen' : getDisplaySnippet(contact)}
                    </p>
                    {contact.unreadCount ? (
                      <span className="ml-2 min-w-[18px] h-[18px] bg-[#00a884] text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {contact.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode === AppMode.CONTACT_SYNC && (
        <div className="flex-1 flex flex-col p-6 space-y-8 animate-in slide-in-from-bottom">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#00a884]/10 rounded-3xl flex items-center justify-center mx-auto mb-6"><UserPlus className="text-[#00a884]" size={36} /></div>
            <h2 className="text-[#e9edef] text-xl font-bold mb-3">Expand Zenj</h2>
            <p className="text-[#8696a0] text-sm">Add individuals or create peaceful group spaces.</p>
          </div>
          <div className="space-y-4">
            <button onClick={onOpenAddFriend} className="w-full bg-[#00a884] text-black font-bold py-4 rounded-2xl hover:bg-[#06cf9c] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00a884]/20"><UserPlus size={18} /> Add Individual</button>
            <button onClick={onOpenCreateGroup} className="w-full bg-[#2a3942] text-[#d1d7db] font-bold py-4 rounded-2xl hover:bg-[#32414a] transition-all flex items-center justify-center gap-2 border border-white/5"><Users size={18} /> Create Zen Group</button>
            
            <button 
              onClick={() => setMode(AppMode.SETTINGS)}
              className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 hover:bg-rose-500/5 rounded-xl text-sm"
            >
              <ShieldAlert size={16} />
              Manage Blocked Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
