import { useCallback, useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

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
      className="flex items-end gap-3 rounded-[28px] bg-[#303030] px-4 py-3 shadow-lg shadow-black/20"
      onSubmit={handleSubmit}
    >
      <textarea
        aria-label="Message"
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-white outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
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

      <button
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!connected || !text.trim() || (!activeChatId && user?.role === 'admin')}
        type="submit"
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
};

export default ChatComposer;
