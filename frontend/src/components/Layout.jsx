import Sidebar from './Sidebar'
import TopBar from './TopBar'
import '../components/Layout.css'

export default function Layout({ children, title }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-content">
        <TopBar title={title} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  )
}
