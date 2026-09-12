import { useState, useRef, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { NeumInput, Icon, Spinner } from '../components/ui'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameTouched = useRef(false)

  const autoFillUsername = (val) => {
    const prefix = val.split('@')[0]
    setUsername(prefix)
  }

  const handleEmailChange = (val) => {
    setEmail(val)
    if (isRegister && !usernameTouched.current) {
      autoFillUsername(val)
    }
  }

  useEffect(() => {
    if (!isRegister) {
      setUsername('')
      usernameTouched.current = false
    } else if (!usernameTouched.current) {
      autoFillUsername(email)
    }
  }, [isRegister])

  const resolveAndLogin = async () => {
    let resolvedEmail = email

    if (!email.includes('@')) {
      const { data, error: rpcError } = await supabase
        .rpc('get_email_by_username', { p_username: email })

      if (rpcError || !data) {
        setError('Usuario no encontrado.')
        setLoading(false)
        return null
      }
      resolvedEmail = data
    }

    return resolvedEmail
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const resolvedEmail = await resolveAndLogin()
    if (!resolvedEmail) return

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    })

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email o contraseña incorrectos.'
        : authError.message)
      setLoading(false)
      return
    }

    onLogin(data.user)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email.includes('@')) {
      setError('Introduce un email válido para registrarte.')
      setLoading(false)
      return
    }

    if (!username.trim()) {
      setError('Elige un nombre de usuario.')
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (authError) {
      setError(authError.message === 'signups not allowed for this instance'
        ? 'Registro no permitido. Tu email no está en la lista blanca.'
        : authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', data.user.id)
      if (updateError) {
        setError('Error al guardar el nombre de usuario.')
        setLoading(false)
        return
      }
      onLogin(data.user)
    } else {
      setError('Registro completado. Revisa tu email para confirmar.')
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen bg-neum-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-neum-text text-center mb-8">
          {isRegister ? 'Registro' : 'Acceder'}
        </h1>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="flex flex-col gap-4">
          <NeumInput
            type="text"
            placeholder="Email o nombre de usuario"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />

          {isRegister && (
            <NeumInput
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => { usernameTouched.current = true; setUsername(e.target.value) }}
              required
            />
          )}

          <div className="relative">
            <NeumInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neum-text-muted hover:text-neum-primary transition-colors"
            >
              <Icon name={showPassword ? 'eye' : 'eyeOff'} className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <p className={`text-sm text-center ${error.includes('completado') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-neum-sm bg-neum-surface shadow-neum-sm mx-auto
              active:shadow-neum-inset-sm active:translate-y-px
              transition-[box-shadow,transform] duration-150 text-neum-primary px-8 py-2.5 text-sm font-medium
              disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading && <Spinner size="sm" />}
            {loading ? 'Espera...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6">
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-neum-text-muted hover:text-neum-primary underline text-sm"
          >
            {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta nueva'}
          </button>
        </p>
      </div>
    </div>
  )
}
