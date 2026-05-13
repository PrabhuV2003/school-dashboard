import { supabase } from './supabase'

// Fetch WA log entries
export async function getWaLog(limit = 20) {
  const response = await supabase.get('/wa_log', {
    params: {
      select: 'id,parent_name,student_name,amount,status,workflow,sent_at,wa_message_id',
      order: 'sent_at.desc',
      limit: limit,
    },
  })
  return response.data
}

// Fetch WA errors
export async function getWaErrors() {
  const response = await supabase.get('/wa_errors', {
    params: {
      select: 'id,parent_name,parent_phone,student_name,error_message,failed_at',
      order: 'failed_at.desc',
    },
  })
  return response.data
}

// Fetch fees summary
export async function getFeesSummary() {
  const [due, overdue, paid] = await Promise.all([
    supabase.get('/fees', {
      params: { status: 'eq.due', select: 'id,amount' },
    }),
    supabase.get('/fees', {
      params: { status: 'eq.overdue', select: 'id,amount' },
    }),
    supabase.get('/fees', {
      params: { status: 'eq.paid', select: 'id,amount' },
    }),
  ])

  const sumAmount = (rows) =>
    rows.reduce((acc, row) => acc + (row.amount || 0), 0)

  return {
    dueCount: due.data.length,
    overdueCount: overdue.data.length,
    paidCount: paid.data.length,
    dueAmount: sumAmount(due.data),
    overdueAmount: sumAmount(overdue.data),
    paidAmount: sumAmount(paid.data),
  }
}

// Fetch all users (teachers)
export async function getTeachers() {
  const response = await supabase.get('/users', {
    params: {
      role: 'eq.teacher',
      select: 'id,name,email,class_assigned,phone',
    },
  })
  return response.data
}