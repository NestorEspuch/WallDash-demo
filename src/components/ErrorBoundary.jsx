import { Component } from 'react'
import { NeumButton } from './ui'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-neum-bg flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-neum bg-neum-surface shadow-neum p-6 text-center">
            <h1 className="text-xl font-bold text-neum-text mb-2">Algo ha ido mal</h1>
            <p className="text-neum-text-muted text-sm mb-6">
              Ha ocurrido un error inesperado. Recarga la app para continuar.
            </p>
            {this.state.error?.message && (
              <p className="text-red-400 text-xs mb-6 break-words">
                {this.state.error.message}
              </p>
            )}
            <NeumButton primary onClick={this.handleReload}>
              Recargar
            </NeumButton>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
