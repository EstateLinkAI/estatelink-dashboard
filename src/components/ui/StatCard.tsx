interface StatCardProps {
  label: string
  value: string
  helper?: string
  accent?: 'neutral' | 'success' | 'accent' | 'warning'
}

const accentMap = {
  neutral: 'border-l-slate-300',
  success: 'border-l-emerald-600',
  accent: 'border-l-blue-700',
  warning: 'border-l-amber-600',
}

export function StatCard({ label, value, helper, accent = 'neutral' }: StatCardProps) {
  return (
    <div className={['rounded-md border border-slate-200 border-l-2 bg-white p-4', accentMap[accent]].join(' ')}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}
