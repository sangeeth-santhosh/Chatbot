import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Mic,
  Paperclip,
  SendHorizonal,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

const comingSoonControls = [
  { label: 'Attach file', icon: Paperclip },
  { label: 'Tools', icon: SlidersHorizontal, text: 'Tools' },
  { label: 'Assistant actions', icon: Sparkles },
];

function ComingSoonControl({ icon: Icon, label, text, variant = 'default' }) {
  const isVoice = variant === 'voice';

  return (
    <span
      aria-disabled="true"
      aria-label={`${label} coming soon`}
      className="group relative inline-flex"
      tabIndex={0}
      title={`${label} coming soon`}
    >
      <button
        aria-hidden="true"
        className={`pointer-events-none inline-flex items-center justify-center gap-2 border border-white/10 text-zinc-300 opacity-60 ${
          isVoice
            ? 'h-10 w-10 rounded-full bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.08)]'
            : 'h-9 rounded-full bg-[#242424] px-3 text-xs'
        }`}
        disabled
        tabIndex={-1}
        type="button"
      >
        <Icon size={isVoice ? 18 : 16} />
        {text && <span>{text}</span>}
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#111111] px-2 py-1 text-[11px] text-zinc-300 shadow-lg group-hover:block group-focus:block">
        Coming soon
      </span>
    </span>
  );
}

const ChatComposer = () => {
  const [text, setText] = useState('');
  const user = useAuthStore((state) => state.user);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const setError = useChatStore((state) => state.setError);
  const socket = useSocketStore((state) => state.socket);
  const connected = useSocketStore((state) => state.connected);
  const typingTimer = useRef(null);

  const stopTyping = useCallback(() => {
    if (socket && activeChatId) {
      socket.emit('typing_stop', { chatId: activeChatId });
    }
  }, [activeChatId, socket]);

  const sendMessage = (chatId, value) => {
    socket.emit('send_message', { chatId, text: value }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to send message.'));
        return;
      }

      if (response.message) {
        addMessage(response.message);
      }
    });
  };

  const createChatAndSend = (value) => {
    socket.emit('create_chat', { title: value.slice(0, 80) }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to create chat.'));
        return;
      }

      setActiveChat(response.chat.id);
      setMessages(response.chat.id, response.messages || []);
      sendMessage(response.chat.id, value);
    });
  };

  const handleChange = (event) => {
    setText(event.target.value);

    if (!socket || !activeChatId) return;

    socket.emit('typing_start', { chatId: activeChatId });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(stopTyping, 900);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = text.trim();

    if (!value || !socket || !connected) return;
    if (!activeChatId && user?.role === 'admin') return;

    if (activeChatId) {
      sendMessage(activeChatId, value);
      stopTyping();
    } else {
      createChatAndSend(value);
    }

    setText('');
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimer.current);
      stopTyping();
    };
  }, [stopTyping]);

  return (
    <form
      className="rounded-[26px] bg-[#303030] px-3 py-2.5 shadow-lg shadow-black/20 md:rounded-[28px] md:px-4 md:py-3"
      onSubmit={handleSubmit}
    >
      <textarea
        aria-label="Message"
        className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 md:max-h-40 md:min-h-10"
        disabled={!connected || (!activeChatId && user?.role === 'admin')}
        maxLength={2000}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event);
          }
        }}
        placeholder={!activeChatId && user?.role === 'admin' ? 'Select a conversation to reply' : 'Ask anything'}
        rows={1}
        value={text}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {comingSoonControls.map((control) => (
            <ComingSoonControl
              icon={control.icon}
              key={control.label}
              label={control.label}
              text={control.text}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ComingSoonControl icon={Mic} label="Dictation" variant="voice" />
          <ComingSoonControl icon={AudioLines} label="Voice mode" variant="voice" />
          <button
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!connected || !text.trim() || (!activeChatId && user?.role === 'admin')}
            type="submit"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatComposer;
