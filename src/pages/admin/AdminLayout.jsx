import { Routes, Route } from 'react-router-dom'
import AdminSidebar from '../../components/shared/AdminSidebar'
import AdminOverview from './AdminOverview'
import WaLog from './WaLog'
import WaErrors from './WaErrors'
import Teachers from './Teachers'
import FaqManager from './FaqManager'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="wa-log" element={<WaLog />} />
          <Route path="errors" element={<WaErrors />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="faq" element={<FaqManager />} />
        </Routes>
      </main>
    </div>
  )
}