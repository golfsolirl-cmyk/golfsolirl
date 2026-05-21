import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  readonly children: ReactNode
}

interface AppErrorBoundaryState {
  readonly hasError: boolean
  readonly message: string
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Something went wrong loading this page.'
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite px-5">
        <div className="max-w-md rounded-[2rem] border border-forest-100 bg-white p-8 text-center shadow-soft">
          <p className="font-ge text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Golf Sol Ireland</p>
          <h1 className="mt-3 font-ge text-2xl font-extrabold text-gs-dark">We hit a snag</h1>
          <p className="mt-3 font-ge text-base leading-relaxed text-forest-700">
            {this.state.message}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-6 py-3 font-ge text-sm font-bold uppercase tracking-[0.12em] text-white"
              onClick={this.handleReload}
              type="button"
            >
              Reload page
            </button>
            <a
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-forest-200 px-6 py-3 font-ge text-sm font-bold uppercase tracking-[0.12em] text-gs-dark"
              href="/"
            >
              Back home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
