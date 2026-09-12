// Gemini deshabilitado temporalmente (cuota gratuita a 0 con claves AQ.)
// Pendiente de que Google resuelva el bug. Se usa Groq mientras tanto.
// import { GoogleGenAI } from '@google/genai'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const FALLBACKS = [
  'No pude realizar la acci\u00f3n. Int\u00e9ntalo de nuevo m\u00e1s tarde.',
  'El asistente no est\u00e1 disponible ahora. Vuelve a intentarlo.',
  'Lo siento, no pude completar la acci\u00f3n. Int\u00e9ntalo de nuevo.',
  'Acci\u00f3n no disponible. Revisa la conexi\u00f3n e int\u00e9ntalo de nuevo.',
]

export async function askGemini(text) {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY

  if (!groqKey) {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Responde en m\u00e1ximo dos frases breves en espa\u00f1ol. S\u00e9 \u00fatil, conciso y directo.',
          },
          { role: 'user', content: text },
        ],
        max_tokens: 150,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.log('Error Groq:', res.status, errBody)
      return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    }

    const data = await res.json()
    return data.choices[0].message.content
  } catch (e) {
    console.log('Error Groq:', e.message)
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
  }
}
