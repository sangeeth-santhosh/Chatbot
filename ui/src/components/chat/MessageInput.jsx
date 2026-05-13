import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Paperclip, Sparkles, Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

export function MessageInput({ chat }) {
  const [text, setText] = useState('');
  const socket = useSocketStore((state) => state.socket);
  const connected = useSocketStore((state) => state.connected);
  const setError = useChatStore((state) => state.setError);
  const typingTimer = useRef(null);

  const stopTyping = useCallback(() => {
    if (socket && chat) {
      socket.emit('typing_stop', { chatId: chat.id });
    }
  }, [chat, socket]);

  const updateText = (event) => {
    setText(event.target.value);

    if (!socket || !chat) return;

    socket.emit('typing_start', { chatId: chat.id });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(stopTyping, 900);
  };

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();

    if (!value || !socket || !chat) return;

    socket.emit('send_message', { chatId: chat.id, text: value }, (response) => {
      if (!response?.ok) {
        setError(new Error(response?.error || 'Unable to send message.'));
      }
    });

    setText('');
    stopTyping();
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(typingTimer.current);
      stopTyping();
    };
  }, [stopTyping]);

  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-800 bg-[#0b0f19] p-4">
      <form
        className="mx-auto flex max-w-4xl flex-col gap-3 rounded-[28px] border border-slate-700 bg-white/5 px-4 py-4 shadow-black/20 backdrop-blur-xl transition"
        onSubmit={submit}
      >
        <textarea
          aria-label="Message input"
          className="min-h-[96px] w-full resize-none rounded-[28px] border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!chat || !connected}
          maxLength={2000}
          onChange={updateText}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              submit(event);
            }
          }}
          placeholder={chat ? 'Ask anything' : 'Select a conversation to chat'}
          rows={2}
          value={text}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <button
              aria-label="Add attachment"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 transition hover:bg-slate-800"
              type="button"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              aria-label="Tools"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 transition hover:bg-slate-800"
              type="button"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Voice input"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 transition hover:bg-slate-800"
              type="button"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              aria-label="Send message"
              className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!chat || !connected || !text.trim()}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
