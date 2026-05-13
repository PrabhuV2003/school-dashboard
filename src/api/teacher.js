import { supabase } from './supabase'

// Get all students for a specific class
export async function getStudentsByClass(className) {
  const response = await supabase.get('/students', {
    params: {
      class: `eq.${className}`,
      select: 'id,name,parent_name,parent_phone,roll_no',
      order: 'roll_no.asc',
    },
  })
  return response.data
}

// Get fees for a specific class
export async function getFeesByClass(className) {
  const response = await supabase.get('/fees', {
    params: {
      class: `eq.${className}`,
      select: 'id,parent_name,student_name,amount,due_date,status',
      order: 'status.asc',
    },
  })
  return response.data
}

// Get homework history for a class
export async function getHomeworkByClass(className) {
  const response = await supabase.get('/homework', {
    params: {
      class: `eq.${className}`,
      select: 'id,subject,description,due_date,created_at,wa_sent',
      order: 'created_at.desc',
      limit: 20,
    },
  })
  return response.data
}

// Save homework to DB
export async function saveHomework(payload) {
  const response = await supabase.post('/homework', payload, {
    headers: { Prefer: 'return=representation' },
  })
  return response.data
}

// Get attendance for today
export async function getTodayAttendance(className) {
  const today = new Date().toISOString().split('T')[0]
  const response = await supabase.get('/attendance', {
    params: {
      class: `eq.${className}`,
      date: `eq.${today}`,
      select: 'student_id,status',
    },
  })
  return response.data
}

// Save attendance batch
export async function saveAttendance(records) {
  const response = await supabase.post('/attendance', records, {
    headers: { Prefer: 'resolution=merge-duplicates' },
  })
  return response.data
}

// Trigger n8n webhook
export async function triggerN8nWebhook(webhookPath, payload) {
  const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
  const response = await fetch(`${baseUrl}/${webhookPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('Webhook trigger failed')
  return response.json()
}