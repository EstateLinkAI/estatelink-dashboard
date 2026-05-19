interface ErrorStateProps {
  title?: string
  message: string
}

export function ErrorState({ title = 'Something went wrong', message }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/25 p-6 text-rose-100">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-100/80">{message}</p>
    </div>
  )
}
