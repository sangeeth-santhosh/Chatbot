import ChatSidebar from './ChatSidebar.jsx';
import ChatViewport from './ChatViewport.jsx';

const ChatLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#212121] text-white md:flex-row">
      <ChatSidebar />
      <ChatViewport />
    </div>
  );
};

export default ChatLayout;
