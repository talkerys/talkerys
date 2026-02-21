import { Profile } from '@/types/database'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

interface AppLayoutProps {
  user: Profile
  children: React.ReactNode
}

export default function AppLayout({ user, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar user={user} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 md:ml-64 pb-20 md:pb-6 px-4 md:px-8 pt-4">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
