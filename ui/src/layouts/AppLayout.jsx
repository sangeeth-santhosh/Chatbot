import { Sidebar } from '../components/sidebar/Sidebar.jsx';

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="flex min-h-screen">
        <aside role="complementary" aria-label="Conversations sidebar">
          <Sidebar />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
