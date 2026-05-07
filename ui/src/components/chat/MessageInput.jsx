import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/chatStore.js';
import { useSocketStore } from '../../store/socketStore.js';

export function MessageInput({ chat }) {
  const [text, setText] = useState('');
  const socket = useSocketStore((state) => state.socket);
  const connected = useSocketStore((state) => state.connected);
  const setError = useChatStore((state) => state.setError);
  const typingTimer = useRef(null);

  const stopTyping = () => {
    if (socket && chat) {
      socket.emit('typing_stop', { roomId: chat.id });
    }
  };

  const updateText = (event) => {
    setText(event.target.value);

    if (!socket || !chat) return;

    socket.emit('typing_start', { roomId: chat.id });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(stopTyping, 900);
  };

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();

    if (!value || !socket || !chat) return;

    socket.emit('send_message', { roomId: chat.id, text: value }, (response) => {
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
  });

  return (
    <form className="border-t border-slate-800 bg-[#0b0f19] p-4" onSubmit={submit}>
      <div className="mx-auto flex max-w-4xl gap-3">
        <textarea
          className="max-h-36 min-h-12 flex-1 resize-none rounded-md border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400"
          disabled={!chat || !connected}
          maxLength={2000}
          onChange={updateText}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              submit(event);
            }
          }}
          placeholder={chat ? 'Send a message...' : 'Choose a room to chat'}
          rows={1}
          value={text}
        />
        <button
          className="h-12 rounded-md bg-slate-100 px-5 text-sm font-medium text-slate-950 hover:bg-white disabled:opacity-60"
          disabled={!chat || !connected || !text.trim()}
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
