import { fetchForecastWithCache, fetchWeather } from './weather'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getClothingAdvice(tempAvg) {
  if (tempAvg >= 28) return 'Vete ligero.'
  if (tempAvg >= 22) return 'Manga corta.'
  if (tempAvg >= 16) return 'Chaqueta ligera.'
  if (tempAvg >= 10) return 'Chaqueta.'
  return 'Abrígate.'
}

function getRainAdvice(popMax, rainTotal) {
  if (popMax >= 0.7 || rainTotal > 5) return 'Paraguas.'
  if (popMax >= 0.4 || rainTotal > 0.5) return 'Quizás paraguas.'
  return ''
}

function getRecommendation(tempAvg, popMax, rainTotal) {
  const clothing = getClothingAdvice(tempAvg)
  const rain = getRainAdvice(popMax, rainTotal)
  if (!rain) return clothing
  return `${clothing.replace('.', '')} y ${rain.toLowerCase()}`
}

function getWindText(windAvg) {
  if (windAvg >= 35) return `Viento fuerte, ${windAvg} km/h.`
  if (windAvg >= 20) return `Viento ${windAvg} km/h.`
  return `Viento ${windAvg} km/h.`
}

export function buildTodayMessage(today, current) {
  const tempAvg = today?.tempAvg ?? current?.temp ?? 0
  const tempMax = today?.tempMax ?? current?.temp ?? 0
  const tempMin = today?.tempMin ?? current?.temp ?? 0
  const windAvg = today?.windAvg ?? current?.wind_speed ?? 0
  const popMax = today?.popMax ?? 0
  const rainTotal = today?.rainTotal ?? 0
  const description = today?.description || current?.description || ''

  const parts = [
    `Hoy, media de ${tempAvg} grados, máxima ${tempMax}, mínima ${tempMin}.`,
    getWindText(windAvg),
    `Lluvia ${Math.round(popMax * 100)}%.`,
  ]

  if (description) {
    parts.push(`${description}.`)
  }

  parts.push(getRecommendation(tempAvg, popMax, rainTotal))

  return parts.join(' ')
}

export async function getTodayWeatherAdvice() {
  const forecast = await fetchForecastWithCache()
  const todayKey = getTodayKey()
  const today = forecast.find((day) => day.date === todayKey)

  let current = null
  if (!today) {
    current = await fetchWeather()
  }

  const message = buildTodayMessage(today, current)
  return {
    message,
    today,
    current,
  }
}
