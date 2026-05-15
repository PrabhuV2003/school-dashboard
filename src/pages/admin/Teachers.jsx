import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTeachers } from '../../api/dashboard'
import { createTeacher } from '../../api/teacher'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  X,
  GraduationCap,
  Phone,
  Mail,
} from 'lucide-react'

const CLASSES = [
  '1A','1B','2A','2B','3A','3B',
  '4A','4B','5A','5B','6A','6B',
  '7A','7B','8A','8B','9A','9B',
  '10A','10B',
]

function TeacherCard({ teacher }) {
  const initials = teacher.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center justify-between py-3
      border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarFallback className="text-xs bg-blue-100
            text-blue-700 font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-slate-700">
            {teacher.name}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs
              text-slate-400">
              <Mail className="w-3 h-3" />
              {teacher.email}
            </span>
            {teacher.phone && (
              <span className="flex items-center gap-1 text-xs
                text-slate-400">
                <Phone className="w-3 h-3" />
                {teacher.phone}
              </span>
            )}
          </div>
        </div>
      </div>
      <Badge
        variant="outline"
        className={`text-xs ${
          teacher.class_assigned
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-50 text-slate-500 border-slate-200'
        }`}
      >
        {teacher.class_assigned
          ? `Class ${teacher.class_assigned}`
          : 'Unassigned'}
      </Badge>
    </div>
  )
}

function CreateTeacherModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    classAssigned: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.phone || !form.classAssigned) {
      setError('All fields are required')
      return
    }

    // Basic phone validation
    if (!/^91\d{10}$/.test(form.phone)) {
      setError('Phone must start with 91 and be 12 digits e.g. 919876543210')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createTeacher({
        name: form.name,
        email: form.email,
        classAssigned: form.classAssigned,
        phone: form.phone,
      })
      onSuccess(result)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create teacher. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center
      justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full
        max-w-md">

        {/* Modal header */}
        <div className="flex items-center justify-between p-5
          border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex
              items-center justify-center">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Create teacher account
              </p>
              <p className="text-xs text-slate-400">
                Login details sent via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg
              transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4">

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50
              border border-red-200 rounded-lg">
              <X className="w-4 h-4 text-red-500 flex-shrink-0
                mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Mrs. Priya Kumar"
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="priya@stmarys.edu"
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              WhatsApp number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="919876543210"
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400">
              Include country code — no + sign e.g. 919876543210
            </p>
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Assign class
            </label>
            <select
              value={form.classAssigned}
              onChange={(e) =>
                handleChange('classAssigned', e.target.value)
              }
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a class</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Modal footer */}
        <div className="flex gap-2 p-5 pt-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create & send WhatsApp
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}

function SuccessBanner({ result, onClose }) {
  return (
    <div className="mb-6 p-4 bg-emerald-50 border
      border-emerald-200 rounded-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600
            flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">
              Teacher account created!
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              Login credentials sent via WhatsApp.
            </p>
            <div className="mt-2 p-2.5 bg-white rounded-lg
              border border-emerald-200">
              <p className="text-xs text-slate-600">
                <span className="font-medium">Email:</span>{' '}
                {result.email}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                <span className="font-medium">Password:</span>{' '}
                {result.password}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-emerald-100 rounded-lg"
        >
          <X className="w-4 h-4 text-emerald-600" />
        </button>
      </div>
    </div>
  )
}

export default function Teachers() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [successResult, setSuccessResult] = useState(null)

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    refetchInterval: 30000,
  })

  function handleSuccess(result) {
    setShowModal(false)
    setSuccessResult(result)
    queryClient.invalidateQueries(['teachers'])
  }

  const assignedCount = teachers?.filter(
    (t) => t.class_assigned
  ).length || 0

  const unassignedCount = teachers?.filter(
    (t) => !t.class_assigned
  ).length || 0

  return (
    <div className="p-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Teachers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create accounts and assign classes
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add teacher
        </Button>
      </div>

      {/* Success banner */}
      {successResult && (
        <SuccessBanner
          result={successResult}
          onClose={() => setSuccessResult(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-slate-700">
            {teachers?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-emerald-700">
            {assignedCount}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Assigned</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-amber-700">
            {unassignedCount}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">Unassigned</p>
        </div>
      </div>

      {/* Teacher list */}
      <Card className="shadow-none border-slate-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700
            flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            All teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}
                  className="h-14 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : teachers?.length === 0 ? (
            <div className="py-10 text-center">
              <GraduationCap className="w-8 h-8 text-slate-300
                mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-3">
                No teachers yet
              </p>
              <Button
                size="sm"
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Add first teacher
              </Button>
            </div>
          ) : (
            <div>
              {teachers?.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create modal */}
      {showModal && (
        <CreateTeacherModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}

    </div>
  )
}