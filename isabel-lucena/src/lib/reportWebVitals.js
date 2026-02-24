import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

function getContext() {
  return {
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    connection: navigator.connection?.effectiveType || undefined,
  }
}

function sendToEndpoint(metric) {
  const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT || '/api/web-vitals'
  if (!endpoint) return

  const payload = {
    ...metric,
    context: getContext(),
    timestamp: Date.now(),
  }

  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon(endpoint, blob)
    return
  }

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

function logInDev(metric) {
  if (import.meta.env.DEV) {
    console.log('[WebVitals]', metric.name, metric.value, metric)
  }
}

export function initWebVitals() {
  const enabled = import.meta.env.VITE_ENABLE_WEB_VITALS === 'true'
  if (!enabled) return

  const reporter = (metric) => {
    logInDev(metric)
    sendToEndpoint(metric)
  }

  onCLS(reporter)
  onINP(reporter)
  onLCP(reporter)
  onFCP(reporter)
  onTTFB(reporter)
}
