const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

export function supportsSpeech() {
  return !!SpeechRecognition
}

export function startListening() {
  if (!SpeechRecognition) {
    const err = new Error('Reconocimiento de voz no soportado')
    const p = Promise.reject(err)
    p.abort = () => {}
    return p
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'es-ES'
  recognition.continuous = false
  recognition.interimResults = false

  let done = false
  let rejectPromise = null
  let speechEndTimer = null
  let timeout = null

  const promise = new Promise((resolve, reject) => {
    rejectPromise = reject

    function finish(err) {
      clearTimeout(timeout)
      clearTimeout(speechEndTimer)
      if (done) return
      done = true
      reject(err)
    }

    timeout = setTimeout(() => {
      if (done) return
      done = true
      recognition.abort()
      reject(new Error('Tiempo de espera agotado'))
    }, 10000)

    recognition.onresult = (event) => {
      clearTimeout(timeout)
      clearTimeout(speechEndTimer)
      done = true
      resolve(event.results[0][0].transcript)
    }

    recognition.onerror = (e) => {
      finish(new Error(e.error === 'aborted' ? 'Cancelado' : 'Error al capturar el audio'))
    }

    recognition.onspeechend = () => {
      clearTimeout(speechEndTimer)
      speechEndTimer = setTimeout(() => {
        if (done) return
        recognition.stop()
      }, 600)
    }

    recognition.onend = () => {
      finish(new Error('No se detect\u00f3 voz'))
    }

    recognition.start()
  })

  promise.abort = () => {
    clearTimeout(timeout)
    clearTimeout(speechEndTimer)
    if (done) return
    done = true
    recognition.abort()
    rejectPromise(new Error('Cancelado'))
  }

  return promise
}
