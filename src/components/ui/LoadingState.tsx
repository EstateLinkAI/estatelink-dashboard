interface LoadingStateProps {
  label?: string
  rows?: number
}

export function LoadingState({ label = 'Loading data...', rows = 3 }: LoadingStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-300">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-cyan-300" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl border border-white/8 bg-slate-950/60"
          />
        ))}
      </div>
    </div>
  )
}
