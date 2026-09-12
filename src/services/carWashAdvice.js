function isRainyDay(day) {
  const rainyConditions = ['Thunderstorm', 'Rain', 'Snow', 'Drizzle']
  return day.popMax >= 0.4 || day.rainTotal > 0.5 || rainyConditions.includes(day.condition)
}

function formatDayName(dayName, index) {
  if (index === 0) return 'hoy'
  if (index === 1) return 'mañana'
  return dayName
}

function getDayLabel(day, index) {
  const name = formatDayName(day.dayName, index)
  return `${name} con un ${Math.round(day.popMax * 100)}%`
}

export function analyzeForecast(days) {
  const rainyDays = days.map((day, index) => ({ ...day, index })).filter((day) => isRainyDay(day))
  const dryDays = days.map((day, index) => ({ ...day, index })).filter((day) => !isRainyDay(day))

  return {
    totalDays: days.length,
    rainyDays,
    dryDays,
    firstRain: rainyDays[0] || null,
  }
}

export function buildCarWashMessage(analysis) {
  const { rainyDays, dryDays, firstRain, totalDays } = analysis

  if (rainyDays.length === 0) {
    return 'Hoy está seco. Puedes lavar el coche, no se espera lluvia en los próximos 5 días.'
  }

  if (!firstRain) {
    return 'Hoy está seco. Puedes lavar el coche, no se espera lluvia en los próximos 5 días.'
  }

  const firstRainIndex = firstRain.index

  if (firstRainIndex === 0) {
    const nextDry = dryDays[0]
    const nextDryText = nextDry
      ? ` Los próximos días secos serán ${formatDayName(nextDry.dayName, nextDry.index)}${dryDays[1] ? ` y ${formatDayName(dryDays[1].dayName, dryDays[1].index)}` : ''}.`
      : ''
    return `Mejor no lavarlo.${nextDryText}`
  }

  if (firstRainIndex === 1) {
    const nextDry = dryDays.filter((d) => d.index > 1).slice(0, 2)
    const nextDryText = nextDry.length > 0
      ? ` Los próximos días secos serán ${nextDry.map((d) => formatDayName(d.dayName, d.index)).join(' y ')}.`
      : ''
    return `Mejor no lavarlo. Mañana se espera lluvia con un ${Math.round(firstRain.popMax * 100)}%.${nextDryText}`
  }

  if (firstRainIndex >= 2 && firstRainIndex <= 3) {
    const dryBeforeRain = dryDays.filter((d) => d.index < firstRainIndex)
    const dryBeforeText = dryBeforeRain.length > 0
      ? ` ${dryBeforeRain.map((d) => formatDayName(d.dayName, d.index).charAt(0).toUpperCase() + formatDayName(d.dayName, d.index).slice(1)).join(' y ')} estará seco.`
      : ''
    return `Puedes lavarlo, pero dentro de ${firstRainIndex} días se espera lluvia con un ${Math.round(firstRain.popMax * 100)}%.${dryBeforeText} Dura poco limpio.`
  }

  const dryBeforeRain = dryDays.filter((d) => d.index < firstRainIndex)
  const dryBeforeText = dryBeforeRain.length > 0
    ? ` ${dryBeforeRain.map((d) => formatDayName(d.dayName, d.index).charAt(0).toUpperCase() + formatDayName(d.dayName, d.index).slice(1)).join(' y ')} estará seco.`
    : ''
  return `Puedes lavarlo ahora.${dryBeforeText} Dentro de ${firstRainIndex} días se espera lluvia con un ${Math.round(firstRain.popMax * 100)}%.`
}

export async function getCarWashAdvice(fetchForecastFn) {
  const days = await fetchForecastFn()
  const analysis = analyzeForecast(days)
  return {
    message: buildCarWashMessage(analysis),
    analysis,
  }
}
