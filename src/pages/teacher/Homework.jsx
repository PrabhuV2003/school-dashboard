import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import {
  getHomeworkByClass,
  saveHomework,
  getStudentsByClass,
  triggerN8nWebhook,
} from '../../api/teacher'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

const SUBJECTS = [
  'Mathematics',
  'English',
  'Tamil',
  'Science',
  'Social Studies',
  'Hindi',
  'Computer Science',
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Homework() {
  const { user } = useAuthStore()
  const className = user?.class_assigned
  const queryClient = useQueryClient()

  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [justSent, setJustSent] = useState(false)

  const { data: homeworkList, isLoading } = useQuery({
    queryKey: ['homework', className],
    queryFn: () => getHomeworkByClass(className),
  })

  const { data: students } = useQuery({
    queryKey: ['students', className],
    queryFn: () => getStudentsByClass(className),
  })

  const parentCount = students?.length || 0

  async function handleSubmit() {
    if (!subject || !description || !dueDate) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      // Save to DB first
      await saveHomework({
        class: className,
        subject,
        description,
        due_date: dueDate,
        wa_sent: true,
        sent_count: parentCount,
      })

      // Trigger n8n webhook to broadcast WhatsApp
      await triggerN8nWebhook('homework-broadcast', {
        class: className,
        subject,
        description,
        dueDate,
        teacher: user.name,
        parents: students?.map((s) => ({
          parent_name: s.parent_name,
          parent_phone: s.parent_phone,
          student_name: s.name,
        })),
      })

      // Refresh homework list
      queryClient.invalidateQueries(['homework', className])

      setSubject('')
      setDescription('')
      setDueDate('')
      setJustSent(true)
      setTimeout(() => setJustSent(false), 4000)
    } catch (err) {
      alert('Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Homework — Class {className}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Post homework and broadcast to {parentCount} parents
        </p>
      </div>

      {/* Post form */}
      <Card className="shadow-none border-slate-100 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700">
            New homework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Complete Ex. 7.3 Q1–10 in notebook"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          {justSent ? (
            <div className="flex items-center gap-2 p-3
              bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">
                Sent to {parentCount} parents via WhatsApp!
              </p>
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
                  Broadcasting to {parentCount} parents...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post & WhatsApp {parentCount} parents
                </>
              )}
            </Button>
          )}

        </CardContent>
      </Card>

      {/* History */}
      <Card className="shadow-none border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700">
            Recent homework
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}
                  className="h-12 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : homeworkList?.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="w-7 h-7 text-slate-300
                mx-auto mb-2" />
              <p className="text-sm text-slate-400">
                No homework posted yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {homeworkList?.map((hw) => (
                <div key={hw.id} className="py-3">
                  <div className="flex items-start
                    justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium
                          text-slate-700">
                          {hw.subject}
                        </p>
                        {hw.wa_sent && (
                          <Badge className="text-xs bg-emerald-50
                            text-emerald-700 border-emerald-200">
                            WA sent · {hw.sent_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {hw.description}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400
                      flex-shrink-0">
                      {timeAgo(hw.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}