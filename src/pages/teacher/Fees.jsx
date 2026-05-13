import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { getFeesByClass } from '../../api/teacher'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IndianRupee } from 'lucide-react'

const STATUS_STYLE = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  due: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
}

export default function Fees() {
  const { user } = useAuthStore()
  const className = user?.class_assigned

  const { data: fees, isLoading } = useQuery({
    queryKey: ['fees', className],
    queryFn: () => getFeesByClass(className),
    refetchInterval: 30000,
  })

  const totalDue = fees
    ?.filter((f) => f.status !== 'paid')
    .reduce((a, b) => a + (b.amount || 0), 0) || 0

  const paidCount = fees?.filter((f) => f.status === 'paid').length || 0
  const pendingCount = fees?.filter((f) => f.status !== 'paid').length || 0

  return (
    <div className="p-6 max-w-2xl">

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Fee tracker — Class {className}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your class only — admin sees all classes
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-emerald-700">
            {paidCount}
          </p>
          <p className="text-xs text-emerald-600 mt-0.5">Paid</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-amber-700">
            {pendingCount}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">Pending</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-slate-700">
            ₹{totalDue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Outstanding</p>
        </div>
      </div>

      {/* Fee list */}
      <Card className="shadow-none border-slate-100">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i}
                  className="h-12 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : fees?.length === 0 ? (
            <div className="py-8 text-center">
              <IndianRupee className="w-7 h-7 text-slate-300
                mx-auto mb-2" />
              <p className="text-sm text-slate-400">No fee records</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {fees?.map((fee) => (
                <div key={fee.id}
                  className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {fee.student_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {fee.parent_name} · Due{' '}
                      {new Date(fee.due_date)
                        .toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium
                      text-slate-700">
                      ₹{fee.amount?.toLocaleString('en-IN')}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        STATUS_STYLE[fee.status] ||
                        STATUS_STYLE.due
                      }`}
                    >
                      {fee.status}
                    </Badge>
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