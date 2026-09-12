import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { MENSTRUATION_ID } from '../constants/colors'

const RANGE_OPTIONS = [
  { value: 'current_month', label: 'Este mes' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'last_6_months', label: 'Últimos 6 meses' },
  { value: 'last_year', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

function rangeDates(key, customStart, customEnd) {
  const now = new Date()
  switch (key) {
    case 'current_month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    case 'last_3_months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 3, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    case 'last_6_months':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 6, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    case 'last_year':
      return {
        start: new Date(now.getFullYear(), now.getMonth() - 12, 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      }
    case 'custom':
      return {
        start: customStart ? new Date(customStart + 'T00:00:00') : null,
        end: customEnd ? new Date(customEnd + 'T23:59:59') : null,
      }
    default:
      return { start: null, end: null }
  }
}

function fmt(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function rangeLabel(start, end) {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  return `Del ${s.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} al ${e.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

function processEvents(events) {
  const periods = []
  let activeStart = null

  for (const ev of events) {
    if (ev.period_phase === 'start') {
      activeStart = ev
    } else if (ev.period_phase === 'end' && activeStart) {
      const startDate = new Date(activeStart.start_at)
      const endDate = new Date(ev.start_at)
      const duration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))
      const prevPeriod = periods[periods.length - 1]
      const cycleDays = prevPeriod
        ? Math.round((startDate - new Date(prevPeriod.startDate)) / (1000 * 60 * 60 * 24))
        : null
      periods.push({ startDate: activeStart.start_at, endDate: ev.start_at, duration, cycleDays })
      activeStart = null
    }
  }

  if (activeStart) {
    const startDate = new Date(activeStart.start_at)
    const prevPeriod = periods[periods.length - 1]
    const cycleDays = prevPeriod
      ? Math.round((startDate - new Date(prevPeriod.startDate)) / (1000 * 60 * 60 * 24))
      : null
    periods.push({ startDate: activeStart.start_at, endDate: null, duration: null, cycleDays })
  }

  return periods
}

function calcStats(periods) {
  const completed = periods.filter((p) => p.duration != null)
  const withCycle = periods.filter((p) => p.cycleDays != null)
  const durations = completed.map((p) => p.duration)
  const cycles = withCycle.map((p) => p.cycleDays)
  const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  return {
    totalPeriods: periods.length,
    completedPeriods: completed.length,
    incompletePeriods: periods.length - completed.length,
    avgDuration: avg(durations),
    minDuration: durations.length > 0 ? Math.min(...durations) : null,
    maxDuration: durations.length > 0 ? Math.max(...durations) : null,
    avgCycle: avg(cycles),
    minCycle: cycles.length > 0 ? Math.min(...cycles) : null,
    maxCycle: cycles.length > 0 ? Math.max(...cycles) : null,
  }
}

function detectAnomalies(periods) {
  const anomalies = []
  periods.forEach((p, i) => {
    const idx = i + 1
    if (!p.endDate) { anomalies.push({ desc: `Período #${idx} incompleto (sin fecha de fin)` }) }
    if (p.duration != null && p.duration > 10) { anomalies.push({ desc: `Período #${idx}: duración de ${p.duration} días (supera lo habitual)` }) }
    if (p.duration != null && p.duration < 2) { anomalies.push({ desc: `Período #${idx}: duración de ${p.duration} días (menos de lo habitual)` }) }
    if (p.cycleDays != null && p.cycleDays < 21) { anomalies.push({ desc: `Ciclo #${idx}: ${p.cycleDays} días (ciclo corto)` }) }
    if (p.cycleDays != null && p.cycleDays > 40) { anomalies.push({ desc: `Ciclo #${idx}: ${p.cycleDays} días (ciclo largo)` }) }
  })
  return anomalies
}

export default function MenstruationReport({ onClose }) {
  const [range, setRange] = useState('current_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [periods, setPeriods] = useState([])
  const [stats, setStats] = useState(null)
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadData = useCallback(async () => {
    const { start, end } = rangeDates(range, customStart, customEnd)
    if (!start || !end) return

    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('assigned_to', MENSTRUATION_ID)
      .gte('start_at', start.toISOString())
      .lte('start_at', end.toISOString())
      .order('start_at', { ascending: true })

    const processed = processEvents(data || [])
    setPeriods(processed)
    setStats(calcStats(processed))
    setAnomalies(detectAnomalies(processed))
    setLoading(false)
  }, [range, customStart, customEnd])

  useEffect(() => { loadData() }, [loadData])

  const dates = rangeDates(range, customStart, customEnd)
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

  function buildPrintHtml() {
    const rows = periods.map((p, i) => {
      const isAnomalous = anomalies.some((a) => a.desc.startsWith(`Período #${i + 1}`) || a.desc.startsWith(`Ciclo #${i + 1}`))
      return `<tr${isAnomalous ? ` style="background:#fef2f2"` : ''}>
        <td style="padding:10px 12px 10px 0;vertical-align:top;color:${isAnomalous ? '#dc2626' : '#6b7280'}">${i + 1}${isAnomalous ? ' ⚠' : ''}</td>
        <td style="padding:10px 12px 10px 0;vertical-align:top;font-weight:500">${fmt(p.startDate)}</td>
        <td style="padding:10px 12px 10px 0;vertical-align:top">${p.endDate ? fmt(p.endDate) : '<span style="color:#9ca3af">—</span>'}</td>
        <td style="padding:10px 12px 10px 0;vertical-align:top">${p.duration != null ? p.duration + ' días' : '<span style="color:#9ca3af">—</span>'}</td>
        <td style="padding:10px 12px 10px 0;vertical-align:top">${p.cycleDays != null ? p.cycleDays + ' días' : '<span style="color:#9ca3af">—</span>'}</td>
      </tr>`
    }).join('')

    const statsHtml = stats ? `
      <div style="margin-top:24px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb">
        <h3 style="font-weight:700;margin-bottom:12px;font-size:14px">Resumen</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Total períodos</td><td style="padding:4px 0;font-weight:500">${stats.totalPeriods} (${stats.incompletePeriods > 0 ? stats.completedPeriods + ' completos, ' + stats.incompletePeriods + ' incompletos' : 'todos completos'})</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Duración media</td><td style="padding:4px 0;font-weight:500">${stats.avgDuration != null ? stats.avgDuration.toFixed(1) + ' días' : '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Período más corto</td><td style="padding:4px 0;font-weight:500">${stats.minDuration != null ? stats.minDuration + ' días' : '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Período más largo</td><td style="padding:4px 0;font-weight:500">${stats.maxDuration != null ? stats.maxDuration + ' días' : '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Ciclo medio</td><td style="padding:4px 0;font-weight:500">${stats.avgCycle != null ? stats.avgCycle.toFixed(1) + ' días' : '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Ciclo más corto / más largo</td><td style="padding:4px 0;font-weight:500">${stats.minCycle != null && stats.maxCycle != null ? stats.minCycle + ' / ' + stats.maxCycle + ' días' : '—'}</td></tr>
        </table>
      </div>` : ''

    const anomaliesHtml = anomalies.length > 0 ? `
      <div style="margin-top:16px;padding:16px;background:#f9fafb;border:1px solid #d1d5db">
        <h3 style="font-weight:700;margin-bottom:8px;font-size:14px">Anomalías detectadas (${anomalies.length})</h3>
        <ul style="padding-left:20px;color:#4b5563;font-size:12px">
          ${anomalies.map((a) => `<li>${a.desc}</li>`).join('')}
        </ul>
      </div>` : ''

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Informe de ciclo menstrual</title></head>
<body style="margin:0;padding:24px;font-family:system-ui,-apple-system,sans-serif;color:black;background:white;font-size:14px;line-height:1.5">
  <div style="margin-bottom:20px">
    <h1 style="font-size:18px;font-weight:700;margin:0 0 4px">Informe de ciclo menstrual</h1>
    <p style="font-size:13px;color:#6b7280;margin:0">${dates.start ? rangeLabel(dates.start, dates.end) : ''}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;text-align:left">
    <thead>
      <tr style="border-bottom:1px solid #d1d5db">
        <th style="padding-bottom:8px;padding-right:12px;font-size:12px;color:#6b7280;text-transform:uppercase">#</th>
        <th style="padding-bottom:8px;padding-right:12px;font-size:12px;color:#6b7280;text-transform:uppercase">Inicio</th>
        <th style="padding-bottom:8px;padding-right:12px;font-size:12px;color:#6b7280;text-transform:uppercase">Fin</th>
        <th style="padding-bottom:8px;padding-right:12px;font-size:12px;color:#6b7280;text-transform:uppercase">Duración</th>
        <th style="padding-bottom:8px;padding-right:12px;font-size:12px;color:#6b7280;text-transform:uppercase">Ciclo</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${statsHtml}
  ${anomaliesHtml}

  <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">Generado el ${today}</p>
</body>
</html>`
  }

  const handleExport = () => {
    setExporting(true)
    const win = window.open('', '_blank')
    if (!win) {
      setExporting(false)
      return
    }
    win.document.write(buildPrintHtml())
    win.document.close()
    win.onafterprint = () => win.close()
    win.print()
    setTimeout(() => {
      setExporting(false)
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-lg rounded-neum bg-neum-surface shadow-neum p-6">
        <h2 className="text-xl font-bold text-neum-text mb-6">Informe de ciclo menstrual</h2>

        <div className="flex flex-col gap-4 mb-6">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
              px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {range === 'custom' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-neum-text-muted text-xs block mb-1">Desde</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                    px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
                />
              </div>
              <div className="flex-1">
                <label className="text-neum-text-muted text-xs block mb-1">Hasta</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-neum-sm bg-neum-bg shadow-neum-inset-sm
                    px-4 py-3 text-neum-text focus:outline-none focus:ring-2 focus:ring-neum-primary-light"
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 rounded-full border-[3px] border-neum-primary border-t-transparent animate-spin" />
          </div>
        ) : periods.length === 0 ? (
          <p className="text-neum-text-muted text-center py-8">No hay datos en este período.</p>
        ) : (
          <p className="text-neum-text text-center py-2">
            {periods.length} {periods.length === 1 ? 'período encontrado' : 'períodos encontrados'}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
              active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
              text-neum-text px-6 py-3 text-base"
          >
            Cerrar
          </button>

          {!loading && periods.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 rounded-neum-sm bg-neum-surface shadow-neum-sm
                active:shadow-neum-inset-sm active:translate-y-px transition-[box-shadow,transform] duration-150
                text-neum-primary px-6 py-3 text-base font-medium disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {exporting ? 'Abriendo...' : 'Exportar PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
