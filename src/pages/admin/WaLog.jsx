import { useQuery } from '@tanstack/react-query'
import { getWaLog } from '../../api/dashboard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function WaLog() {
  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['wa-log-full'],
    queryFn: () => getWaLog(50),
    refetchInterval: 15000,
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            WhatsApp activity log
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Every message sent — refreshes every 15 seconds
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${
            isFetching ? 'animate-spin' : ''
          }`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-none border-slate-100">
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i}
                  className="h-12 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : logs?.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300
                mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                No messages sent yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {logs?.map((log) => (
                <div key={log.id}
                  className="flex items-center justify-between
                    py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50
                      flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4
                        text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {log.parent_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {log.student_name} · ₹
                        {log.amount?.toLocaleString('en-IN')} ·{' '}
                        <span className="font-mono text-slate-300">
                          {log.wa_message_id?.slice(0, 20)}...
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize border-slate-200
                        text-slate-500"
                    >
                      {log.status}
                    </Badge>
                    <span className="text-xs text-slate-400 w-16
                      text-right">
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