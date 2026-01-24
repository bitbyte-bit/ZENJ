
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Contact, Message, AppMode, CallState, 
  UserProfile, Moment, AppSettings 
} from './types';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageGenView from './components/ImageGenView';
import ProfileView from './components/ProfileView';
import LiveCallOverlay from './components/LiveCallOverlay';
import AddFriendModal from '@/components/AddFriendModal';
import CreateGroupModal from './components/CreateGroupModal';
import StatusView from './components/StatusView';
import GroupSettingsView from './components/GroupSettingsView';
import SettingsView from './components/SettingsView';
import { generateResponse } from './services/gemini';
import { Sparkles } from 'lucide-react';

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'zenj-main',
    name: 'Zenj AI',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zenj',
    status: 'online',
    lastMessageSnippet: 'How can I help you today?',
    lastMessageTime: Date.now(),
    systemInstruction: "You are Zenj, a calm and wise companion. You speak with clarity and kindness.",
    unreadCount: 0
  },
  {
    id: 'creative-muse',
    name: 'Creative Muse',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Muse',
    status: 'online',
    lastMessageSnippet: 'Let us build a world together.',
    lastMessageTime: Date.now() - 3600000,
    systemInstruction: "You are a Creative Muse. You love metaphors, storytelling, and encouraging the user's creative ideas.",
    unreadCount: 0
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  wallpaper: '',
  vibrations: true,
  notifications: true
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'me',
  name: 'Zen User',
  phone: '+1 234 567 890',
  bio: 'Living a minimalist life with Zenj AI.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zen',
  settings: DEFAULT_SETTINGS
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHATS);
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('zenj_contacts_v6');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [moments, setMoments] = useState<Moment[]>(() => {
    const saved = localStorage.getItem('zenj_moments');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [call, setCall] = useState<CallState>({ isActive: false, type: null, contact: null });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zenj_profile_v6');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [conversations, setConversations] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('zenj_conversations_v6');
    return saved ? JSON.parse(saved) : {
      'zenj-main': [{
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to Zenj. I am your calm companion. Send me a message or a photo to begin.',
        timestamp: Date.now(),
        type: 'text'
      }]
    };
  });

  useEffect(() => { localStorage.setItem('zenj_conversations_v6', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('zenj_profile_v6', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('zenj_contacts_v6', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('zenj_moments', JSON.stringify(moments)); }, [moments]);

  const activeContact = activeContactId ? contacts.find(c => c.id === activeContactId) : null;
  const activeMessages = activeContactId ? conversations[activeContactId] || [] : [];

  const playNotification = useCallback(() => {
    if (userProfile.settings.notifications) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
    if (userProfile.settings.vibrations && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [userProfile.settings]);

  const handleSendMessage = async (content: string, imageUrl?: string, audioUrl?: string) => {
    if (!activeContactId || !activeContact) return;

    const messageId = Date.now().toString();
    const userMsg: Message = {
      id: messageId,
      role: 'user',
      content: audioUrl ? 'Voice note' : content,
      timestamp: Date.now(),
      type: audioUrl ? 'audio' : (imageUrl ? 'image' : 'text'),
      mediaUrl: audioUrl || imageUrl,
      status: 'sent',
      reactions: {}
    };

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), userMsg]
    }));

    setIsTyping(true);

    try {
      let responseText = "";
      if (activeContact.isGroup) {
        responseText = `Zen Guardian: Acknowledged. I am watching over "${activeContact.name}".`;
      } else {
         responseText = await generateResponse(content, activeMessages, activeContact.systemInstruction, imageUrl);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        type: 'text'
      };

      setConversations(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), assistantMsg]
      }));

      setContacts(prev => prev.map(c => 
        c.id === activeContactId 
          ? { ...c, lastMessageSnippet: responseText.slice(0, 40), lastMessageTime: Date.now(), unreadCount: 0 }
          : c
      ));

      if (activeContactId !== activeContactId) playNotification();

    } catch (error) { console.error(error); } finally { setIsTyping(false); }
  };

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleBlockContact = (id: string) => {
    if (confirm("Block this contact? They will no longer be able to message you.")) {
      handleUpdateContact(id, { isBlocked: true });
      setActiveContactId(null);
    }
  };

  const handleTransferOwnership = (id: string, contactId: string) => {
    if (confirm("Transfer group ownership? You will lose admin privileges.")) {
      handleUpdateContact(id, { ownerId: contactId });
    }
  };

  const isMobile = window.innerWidth < 768;
  const showSidebar = !isMobile || (mode !== AppMode.CHATS || !activeContactId);

  return (
    <div className={`flex h-screen overflow-hidden font-sans text-[#f8fafc] theme-${userProfile.settings.theme}`}>
      <style>{`
        .theme-dark { --bg: #0b141a; --header: #202c33; --accent: #00a884; }
        .theme-zen-emerald { --bg: #064e3b; --header: #065f46; --accent: #34d399; }
        .theme-zen-ocean { --bg: #0c4a6e; --header: #075985; --accent: #38bdf8; }
        body { background-color: var(--bg); }
      `}</style>

      {call.isActive && call.contact && (
        <LiveCallOverlay 
          contact={call.contact} 
          type={call.type} 
          onEnd={() => setCall({ isActive: false, type: null, contact: null })} 
        />
      )}

      <AddFriendModal isOpen={isAddFriendModalOpen} onClose={() => setIsAddFriendModalOpen(false)} onAdd={(p) => {
         const id = `f-${Date.now()}`;
         setContacts(prev => [{ id, name: p, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p}`, status: 'offline', lastMessageSnippet: 'Invite shared.', lastMessageTime: Date.now(), systemInstruction: "Zen Friend.", phone: p, isInvitePlaceholder: true }, ...prev]);
      }} userName={userProfile.name} />
      
      <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} contacts={contacts} onCreate={(name, members) => {
        const id = `g-${Date.now()}`;
        const newGroup: Contact = { id, name, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`, status: 'online', lastMessageSnippet: 'Group created.', lastMessageTime: Date.now(), systemInstruction: "Guardian.", isGroup: true, members: [...members, 'me'], ownerId: 'me' };
        setContacts(prev => [newGroup, ...prev]);
        setActiveContactId(id);
      }} />

      {showSidebar && (
        <div className="w-full md:w-[30%] md:min-w-[350px] md:max-w-[450px] h-full flex flex-col border-r border-[#222d34]">
          <Sidebar 
            contacts={contacts} 
            activeContactId={activeContactId} 
            onSelectContact={(id) => { 
              setActiveContactId(id); 
              setMode(AppMode.CHATS); 
              setContacts(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
            }} 
            mode={mode} 
            setMode={setMode} 
            userProfile={userProfile} 
            onOpenAddFriend={() => setIsAddFriendModalOpen(true)} 
            onOpenCreateGroup={() => setIsCreateGroupModalOpen(true)} 
            conversations={conversations} 
          />
        </div>
      )}

      {(!isMobile || !showSidebar) && (
        <div className="flex-1 h-full relative overflow-hidden safe-top">
          {mode === AppMode.CHATS && activeContact && (
            <ChatView 
              contact={activeContact} 
              messages={activeMessages} 
              onSendMessage={handleSendMessage} 
              onReactToMessage={() => {}} 
              onStartCall={(t) => setCall({ isActive: true, type: t, contact: activeContact })} 
              onBlockContact={handleBlockContact}
              onOpenGroupSettings={() => setMode(AppMode.GROUP_SETTINGS)}
              isTyping={isTyping} 
              onBack={isMobile ? () => setActiveContactId(null) : undefined} 
              userProfile={userProfile} 
            />
          )}

          {mode === AppMode.GROUP_SETTINGS && activeContact?.isGroup && (
            <GroupSettingsView 
              group={activeContact}
              contacts={contacts}
              userProfile={userProfile}
              onBack={() => setMode(AppMode.CHATS)}
              onUpdate={(upd) => handleUpdateContact(activeContact.id, upd)}
              onDelete={() => {
                if(confirm("Delete this group permanently?")) {
                  setContacts(prev => prev.filter(c => c.id !== activeContact.id));
                  setActiveContactId(null);
                  setMode(AppMode.CHATS);
                }
              }}
              onAddMember={(cid) => handleUpdateContact(activeContact.id, { members: [...(activeContact.members || []), cid] })}
              onRemoveMember={(cid) => handleUpdateContact(activeContact.id, { members: (activeContact.members || []).filter(m => m !== cid) })}
              onTransferOwnership={(cid) => handleTransferOwnership(activeContact.id, cid)}
            />
          )}

          {mode === AppMode.SETTINGS && (
            <SettingsView 
              profile={userProfile}
              contacts={contacts}
              onBack={() => setMode(AppMode.CHATS)}
              onUpdateSettings={(s) => setUserProfile(p => ({ ...p, settings: { ...p.settings, ...s } }))}
              onUnblockContact={(cid) => handleUpdateContact(cid, { isBlocked: false })}
              onClearData={() => {
                if(confirm("Erase all local data?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            />
          )}

          {mode === AppMode.ZEN_SPACE && <ImageGenView />}
          {mode === AppMode.PROFILE && <ProfileView profile={userProfile} onUpdate={setUserProfile} onBack={() => setMode(AppMode.CHATS)} />}
          {mode === AppMode.STATUS && <StatusView moments={moments} onAddMoment={(c, m) => setMoments(prev => [{ id: `m-${Date.now()}`, userId: 'me', userName: userProfile.name, userAvatar: userProfile.avatar, content: c, mediaUrl: m, timestamp: Date.now(), type: m ? 'image' : 'text' }, ...prev])} userProfile={userProfile} />}
          
          {mode === AppMode.CHATS && !activeContact && !isMobile && (
            <div className="h-full flex flex-col items-center justify-center bg-[#0b141a] p-12 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[40px] flex items-center justify-center mb-6"><Sparkles size={48} className="text-[#00a884]" /></div>
              <h1 className="text-3xl font-bold font-outfit mb-2">Zenj Chat</h1>
              <p className="text-[#8696a0] max-w-sm">Quiet conversations, infinite depth. Choose a chat to begin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
