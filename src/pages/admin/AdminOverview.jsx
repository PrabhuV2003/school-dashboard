import { useQuery } from '@tanstack/react-query'
import { getFeesSummary, getWaLog } from '../../api/dashboard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <Card className="shadow-none border-slate-100">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-slate-800">
              {value}
            </p>
            {sub && (
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function AdminOverview() {
  const { data: fees, isLoading: feesLoading } = useQuery({
    queryKey: ['fees-summary'],
    queryFn: getFeesSummary,
    refetchInterval: 30000,
  })

  const { data: waLog, isLoading: logLoading } = useQuery({
    queryKey: ['wa-log'],
    queryFn: () => getWaLog(5),
    refetchInterval: 15000,
  })

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Overview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Live snapshot of fees and WhatsApp activity
        </p>
      </div>

      {/* Stats Grid */}
      {feesLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-none border-slate-100">
              <CardContent className="pt-5">
                <div className="h-16 bg-slate-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Amount collected"
            value={formatCurrency(fees?.paidAmount || 0)}
            sub={`${fees?.paidCount || 0} parents paid`}
            icon={CheckCircle2}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            title="Due this cycle"
            value={formatCurrency(fees?.dueAmount || 0)}
            sub={`${fees?.dueCount || 0} parents pending`}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Overdue"
            value={formatCurrency(fees?.overdueAmount || 0)}
            sub={`${fees?.overdueCount || 0} parents overdue`}
            icon={AlertCircle}
            color="bg-red-50 text-red-600"
          />
        </div>
      )}

      {/* Recent WA Activity */}
      <Card className="shadow-none border-slate-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium
              text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recent WhatsApp activity
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500
                rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100
                  rounded animate-pulse" />
              ))}
            </div>
          ) : waLog?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No messages sent yet
            </p>
          ) : (
            <div className="space-y-2">
              {waLog?.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between
                    py-2.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-50
                      flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3.5 h-3.5
                        text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {log.parent_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {log.student_name} ·{' '}
                        {formatCurrency(log.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-200
                        text-slate-500"
                    >
                      {log.workflow?.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {timeAgo(log.sent_at)}
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