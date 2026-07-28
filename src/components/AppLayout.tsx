import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';

export default function AppLayout({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} onSignOut={onSignOut} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
