import AdminConversationList from './AdminConversationList.jsx';

const AdminSidebar = ({ activeChatId, chats, onSelect, onlineUsersById }) => {
  return (
    <>
      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        User conversations
      </div>
      <AdminConversationList
        activeChatId={activeChatId}
        chats={chats}
        onSelect={onSelect}
        onlineUsersById={onlineUsersById}
      />
    </>
  );
};

export default AdminSidebar;
