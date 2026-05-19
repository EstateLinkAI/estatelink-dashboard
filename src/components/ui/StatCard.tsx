interface StatCardProps {
  label: string
  value: string
  helper?: string
  accent?: 'neutral' | 'emerald' | 'cyan' | 'amber'
}

const accentMap = {
  neutral: 'border-white/10',
  emerald: 'border-emerald-500/20',
  cyan: 'border-cyan-400/20',
  amber: 'border-amber-400/20',
}

export function StatCard({ label, value, helper, accent = 'neutral' }: StatCardProps) {
  return (
    <div
      className={[
        'rounded-2xl border bg-slate-900/75 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.28)]',
        accentMap[accent],
      ].join(' ')}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
    </div>
  )
}
