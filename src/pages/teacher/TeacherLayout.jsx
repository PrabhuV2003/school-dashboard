import { Routes, Route } from 'react-router-dom'
import TeacherSidebar from '../../components/shared/TeacherSidebar'
import Attendance from './Attendance'
import Homework from './Homework'
import Fees from './Fees'
import Reports from './Reports'

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Attendance />} />
          <Route path="homework" element={<Homework />} />
          <Route path="fees" element={<Fees />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}