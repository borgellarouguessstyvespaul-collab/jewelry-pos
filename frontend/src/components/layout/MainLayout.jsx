import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="app-viewport">
      <div className="app-frame">
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100%',
            maxHeight: 'calc(100vh - 64px)',
            paddingRight: '6px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
