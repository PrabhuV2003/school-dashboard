import { supabase } from './supabase'

// Get all FAQs
export async function getFaqs() {
  const response = await supabase.get('/faqs', {
    params: {
      select: 'id,question,answer,category,is_active,created_at',
      order: 'created_at.desc',
    },
  })
  return response.data
}

// Get school info
export async function getSchoolInfo() {
  const response = await supabase.get('/school_info', {
    params: { select: '*' },
  })
  return response.data?.[0] || null
}

// Add new FAQ
export async function addFaq({ question, answer, category }) {
  const response = await supabase.post(
    '/faqs',
    { question, answer, category, is_active: true },
    { headers: { Prefer: 'return=representation' } }
  )
  return response.data
}

// Update FAQ
export async function updateFaq(id, updates) {
  const response = await supabase.patch(
    '/faqs',
    updates,
    {
      params: { id: `eq.${id}` },
      headers: { Prefer: 'return=representation' },
    }
  )
  return response.data
}

// Delete FAQ
export async function deleteFaq(id) {
  await supabase.delete('/faqs', {
    params: { id: `eq.${id}` },
  })
}

// Update school info
export async function updateSchoolInfo(updates) {
  const response = await supabase.patch(
    '/school_info',
    { ...updates, updated_at: new Date().toISOString() },
    {
      params: { id: 'eq.1' },
      headers: { Prefer: 'return=representation' },
    }
  )
  return response.data
}