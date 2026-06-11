import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface Props {
  children: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Erreur inattendue' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-[var(--radius-organic)] surface-card text-center"
        >
          <AlertCircle className="w-8 h-8 text-pulse" aria-hidden="true" />
          <p className="font-serif text-xl text-vellum">Affichage interrompu</p>
          <p className="text-vellum/45 text-sm max-w-md font-mono">{this.state.message}</p>
          <Button variant="ghost" icon={<RefreshCw className="w-4 h-4" />} onClick={this.handleReset}>
            Réessayer
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
