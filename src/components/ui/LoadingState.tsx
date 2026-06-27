interface LoadingStateProps {
  label?: string
  rows?: number
}

export function LoadingState({ label = 'Loading data...', rows = 3 }: LoadingStateProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 text-slate-600">
      <div className="flex items-center gap-2.5">
        <div className="h-2 w-2 rounded-full bg-blue-700" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md border border-slate-100 bg-slate-50" />
        ))}
      </div>
    </div>
  )
}
