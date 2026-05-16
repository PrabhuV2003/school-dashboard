import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  getSchoolInfo,
  updateSchoolInfo,
} from '../../api/faq'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from
  '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  BookOpen,
  School,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

const CATEGORIES = [
  'general',
  'fees',
  'timings',
  'holidays',
  'attendance',
  'documents',
  'uniform',
  'meetings',
  'contact',
]

const CATEGORY_COLORS = {
  fees: 'bg-amber-50 text-amber-700 border-amber-200',
  timings: 'bg-blue-50 text-blue-700 border-blue-200',
  holidays: 'bg-purple-50 text-purple-700 border-purple-200',
  attendance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  documents: 'bg-slate-50 text-slate-600 border-slate-200',
  uniform: 'bg-pink-50 text-pink-700 border-pink-200',
  meetings: 'bg-orange-50 text-orange-700 border-orange-200',
  contact: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  general: 'bg-slate-50 text-slate-600 border-slate-200',
}

// ─── Add FAQ Form ─────────────────────────────────────────────
function AddFaqForm({ onAdded }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSubmit() {
    if (!question.trim() || !answer.trim()) return
    setLoading(true)
    try {
      await addFaq({ question, answer, category })
      setQuestion('')
      setAnswer('')
      setCategory('general')
      setOpen(false)
      onAdded()
    } catch (err) {
      alert('Failed to add FAQ')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add FAQ
      </Button>
    )
  }

  return (
    <Card className="shadow-none border-blue-200 mb-4">
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What are the school timings?"
            className="w-full px-3 py-2 border border-slate-200
              rounded-lg text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the full answer here..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200
              rounded-lg text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200
              rounded-lg text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading || !question || !answer}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Save FAQ
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── FAQ Row ──────────────────────────────────────────────────
function FaqRow({ faq, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [question, setQuestion] = useState(faq.question)
  const [answer, setAnswer] = useState(faq.answer)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateFaq(faq.id, { question, answer })
      setEditing(false)
      onUpdated()
    } catch (err) {
      alert('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    try {
      await updateFaq(faq.id, { is_active: !faq.is_active })
      onUpdated()
    } catch (err) {
      alert('Failed to toggle')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this FAQ?')) return
    try {
      await deleteFaq(faq.id)
      onDeleted()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  if (editing) {
    return (
      <div className="py-3 border-b border-slate-50">
        <div className="space-y-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300
              rounded-lg text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-blue-300
              rounded-lg text-sm focus:outline-none
              focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
            >
              {loading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Check className="w-3 h-3 mr-1" />}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false)
                setQuestion(faq.question)
                setAnswer(faq.answer)
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`py-3 border-b border-slate-50 last:border-0
      ${!faq.is_active ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-medium text-slate-700">
              {faq.question}
            </p>
            <Badge
              variant="outline"
              className={`text-xs capitalize flex-shrink-0
                ${CATEGORY_COLORS[faq.category] ||
                  CATEGORY_COLORS.general}`}
            >
              {faq.category}
            </Badge>
            {!faq.is_active && (
              <Badge variant="outline"
                className="text-xs bg-slate-50 text-slate-400
                  border-slate-200">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {faq.answer}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleToggle}
            className="p-1.5 hover:bg-slate-100 rounded-lg
              transition-colors"
            title={faq.is_active ? 'Deactivate' : 'Activate'}
          >
            {faq.is_active
              ? <ToggleRight className="w-4 h-4 text-emerald-500" />
              : <ToggleLeft className="w-4 h-4 text-slate-400" />}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 hover:bg-slate-100 rounded-lg
              transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-50 rounded-lg
              transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── School Info Form ─────────────────────────────────────────
function SchoolInfoForm() {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: info, isLoading } = useQuery({
    queryKey: ['school-info'],
    queryFn: getSchoolInfo,
  })

  const [form, setForm] = useState({
    school_name: '',
    address: '',
    phone: '',
    email: '',
    principal_name: '',
    timings: '',
    website: '',
  })

  // Sync form when data loads
  useState(() => {
    if (info) setForm({ ...form, ...info })
  })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateSchoolInfo(form)
      queryClient.invalidateQueries(['school-info'])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Failed to save school info')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i}
            className="h-10 bg-slate-100 rounded animate-pulse"
          />
        ))}
      </div>
    )
  }

  const fields = [
    { key: 'school_name', label: 'School name',
      placeholder: "St. Mary's School" },
    { key: 'principal_name', label: 'Principal name',
      placeholder: 'Dr. S. Rajan' },
    { key: 'address', label: 'Address',
      placeholder: '123 Main Road, Chennai' },
    { key: 'phone', label: 'Office phone',
      placeholder: '044-XXXXXXXX' },
    { key: 'email', label: 'School email',
      placeholder: 'info@stmarys.edu' },
    { key: 'timings', label: 'School timings',
      placeholder: 'Mon-Fri 8:30 AM to 3:30 PM' },
    { key: 'website', label: 'Website',
      placeholder: 'www.stmarys.edu' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              {field.label}
            </label>
            <input
              type="text"
              value={form[field.key] || info?.[field.key] || ''}
              onChange={(e) =>
                handleChange(field.key, e.target.value)
              }
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-slate-200
                rounded-lg text-sm focus:outline-none
                focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      {saved ? (
        <div className="flex items-center gap-2 p-3 bg-emerald-50
          border border-emerald-200 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">
            School info saved successfully
          </p>
        </div>
      ) : (
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save school info
            </>
          )}
        </Button>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function FaqManager() {
  const queryClient = useQueryClient()

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: getFaqs,
  })

  const activeFaqs = faqs?.filter((f) => f.is_active) || []
  const inactiveFaqs = faqs?.filter((f) => !f.is_active) || []

  function refresh() {
    queryClient.invalidateQueries(['faqs'])
  }

  return (
    <div className="p-6 max-w-3xl">

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          FAQ & school info
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          The AI reads this data to answer parent WhatsApp messages
        </p>
      </div>

      <Tabs defaultValue="faqs">
        <TabsList className="mb-6">
          <TabsTrigger value="faqs" className="gap-2">
            <BookOpen className="w-4 h-4" />
            FAQs
            <Badge variant="outline"
              className="ml-1 text-xs border-slate-200">
              {activeFaqs.length} active
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="school" className="gap-2">
            <School className="w-4 h-4" />
            School info
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <AddFaqForm onAdded={refresh} />

          <Card className="shadow-none border-slate-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium
                  text-slate-700">
                  All FAQs ({faqs?.length || 0})
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Toggle off to hide from AI without deleting
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}
                      className="h-16 bg-slate-100 rounded
                        animate-pulse"
                    />
                  ))}
                </div>
              ) : faqs?.length === 0 ? (
                <div className="py-8 text-center">
                  <BookOpen className="w-7 h-7 text-slate-300
                    mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    No FAQs yet — add your first one above
                  </p>
                </div>
              ) : (
                <div>
                  {faqs?.map((faq) => (
                    <FaqRow
                      key={faq.id}
                      faq={faq}
                      onUpdated={refresh}
                      onDeleted={refresh}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* School Info Tab */}
        <TabsContent value="school">
          <Card className="shadow-none border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium
                text-slate-700">
                School details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SchoolInfoForm />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}