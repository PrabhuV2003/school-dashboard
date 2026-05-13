import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { getStudentsByClass, triggerN8nWebhook } from '../../api/teacher'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Loader2,
} from 'lucide-react'

const STATUS_CONFIG = {
  present: {
    label: 'Present',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
}

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function Attendance() {
  const { user } = useAuthStore()
  const className = user?.class_assigned

  const [attendance, setAttendance] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', className],
    queryFn: () => getStudentsByClass(className),
    onSuccess: (data) => {
      // Default all students to present
      const defaults = {}
      data.forEach((s) => {
        defaults[s.id] = 'present'
      })
      setAttendance(defaults)
    },
  })

  function setStatus(studentId, status) {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  const absentStudents = students?.filter(
    (s) => attendance[s.id] === 'absent'
  ) || []

  const presentCount = students?.filter(
    (s) => attendance[s.id] === 'present'
  ).length || 0

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Build payload for n8n webhook
      const payload = {
        class: className,
        teacher: user.name,
        date: new Date().toISOString().split('T')[0],
        attendance: students.map((s) => ({
          student_id: s.id,
          student_name: s.name,
          parent_phone: s.parent_phone,
          parent_name: s.parent_name,
          class: className,
          status: attendance[s.id] || 'present',
        })),
        absent_students: absentStudents.map((s) => ({
          student_name: s.name,
          parent_phone: s.parent_phone,
          parent_name: s.parent_name,
          class: className,
        })),
      }

      await triggerN8nWebhook('attendance-alert', payload)
      setSubmitted(true)
    } catch (err) {
      alert('Failed to submit attendance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i}
              className="h-14 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Attendance — Class {className}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{today}</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-emerald-700">
            {presentCount}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Present</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-red-700">
            {absentStudents.length}
          </p>
          <p className="text-xs text-red-600 mt-0.5">Absent</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-slate-700">
            {students?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Student list */}
      <Card className="shadow-none border-slate-100 mb-4">
        <CardContent className="pt-4">
          <div className="divide-y divide-slate-50">
            {students?.map((student) => {
              const status = attendance[student.id] || 'present'
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between
                    py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Roll {student.roll_no} · {student.parent_name}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {Object.entries(STATUS_CONFIG).map(
                      ([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setStatus(student.id, key)}
                          className={`px-2.5 py-1 rounded-md text-xs
                            font-medium border transition-all ${
                            status === key
                              ? config.color
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {config.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      {submitted ? (
        <div className="flex items-center gap-2 p-4 bg-emerald-50
          border border-emerald-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600
            flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Attendance submitted!
            </p>
            <p className="text-xs text-emerald-600">
              {absentStudents.length > 0
                ? `WhatsApp alerts sent to ${absentStudents.length} absent parent(s)`
                : 'All students present — no alerts needed'}
            </p>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending WhatsApp alerts...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit & send WhatsApp alerts
              {absentStudents.length > 0 &&
                ` (${absentStudents.length} absent)`}
            </>
          )}
        </Button>
      )}

    </div>
  )
}