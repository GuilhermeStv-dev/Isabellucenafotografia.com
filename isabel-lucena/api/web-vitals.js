import { appendFile, access } from 'node:fs/promises'
import path from 'node:path'

const CSV_PATH = '/tmp/web-vitals.csv'
const CSV_HEADER = 'timestamp,name,value,rating,id,delta,navigationType,pathname,viewport,connection,userAgent\n'
const DEFAULT_TABLE = 'web_vitals'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WEB_VITALS_TABLE = process.env.WEB_VITALS_TABLE || DEFAULT_TABLE

const sanitize = (value = '') =>
  String(value).replace(/[\n\r]+/g, ' ').replace(/,/g, ';').trim()

const normalizeNumber = (value, fallback = null) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback

const normalizePayload = (payload) => {
  const context = payload?.context || {}
  return {
    timestamp: new Date(payload?.timestamp || Date.now()).toISOString(),
    name: sanitize(payload?.name),
    value: normalizeNumber(payload?.value),
    rating: sanitize(payload?.rating),
    metric_id: sanitize(payload?.id),
    delta: normalizeNumber(payload?.delta),
    navigation_type: sanitize(payload?.navigationType),
    pathname: sanitize(context?.pathname),
    viewport: sanitize(context?.viewport),
    connection: sanitize(context?.connection),
    user_agent: sanitize(context?.userAgent),
  }
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

async function insertIntoSupabase(row) {
  const endpoint = `${SUPABASE_URL}/rest/v1/${WEB_VITALS_TABLE}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase insert failed (${response.status}): ${text}`)
  }
}

async function ensureHeader() {
  try {
    await access(CSV_PATH)
  } catch {
    await appendFile(CSV_PATH, CSV_HEADER, 'utf8')
  }
}

function toCsvLine(payload) {
  const context = payload?.context || {}
  const cols = [
    payload?.timestamp || Date.now(),
    sanitize(payload?.name),
    Number.isFinite(payload?.value) ? payload.value : '',
    sanitize(payload?.rating),
    sanitize(payload?.id),
    Number.isFinite(payload?.delta) ? payload.delta : '',
    sanitize(payload?.navigationType),
    sanitize(context?.pathname),
    sanitize(context?.viewport),
    sanitize(context?.connection),
    sanitize(context?.userAgent),
  ]
  return `${cols.join(',')}\n`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    if (!payload || typeof payload !== 'object' || !payload.name) {
      return res.status(400).json({ error: 'Invalid payload' })
    }

    const normalized = normalizePayload(payload)
    let persistedIn = 'tmp'

    if (hasSupabaseConfig()) {
      try {
        await insertIntoSupabase(normalized)
        persistedIn = 'supabase'
      } catch (supabaseError) {
        console.error('[web-vitals:supabase:error]', supabaseError)
        await ensureHeader()
        const line = toCsvLine(payload)
        await appendFile(CSV_PATH, line, 'utf8')
      }
    } else {
      await ensureHeader()
      const line = toCsvLine(payload)
      await appendFile(CSV_PATH, line, 'utf8')
    }

    console.info('[web-vitals]', JSON.stringify({
      name: payload.name,
      value: payload.value,
      rating: payload.rating,
      pathname: payload?.context?.pathname,
      sink: persistedIn,
      file: persistedIn === 'tmp' ? path.basename(CSV_PATH) : undefined,
    }))

    return res.status(204).end()
  } catch (error) {
    console.error('[web-vitals:error]', error)
    return res.status(500).json({ error: 'Failed to ingest web vitals' })
  }
}
