interface ErrorStateProps {
  title?: string
  message: string
}

export function ErrorState({ title = 'Something went wrong', message }: ErrorStateProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
    </div>
  )
}
