import Sidebar from './Sidebar'
import './globals.css'
import styles from './page.module.css'

export const metadata = { title: 'Sitter Dashboard' }

export default function SitterLayout({ children }){
  return (
    <div className={styles.dashboardShell}>
      <Sidebar />
      <main style={{minHeight:'100vh'}}>
        {children}
      </main>
    </div>
  )
}
