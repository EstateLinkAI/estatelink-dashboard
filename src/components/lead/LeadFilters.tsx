import type { LeadsFilters } from '../../types/lead'

export interface LeadFilterFormState {
  city: string
  postcodeArea: string
  propertyType: string
  sourcePlatform: string
  minScore: string
}

interface LeadFiltersProps {
  form: LeadFilterFormState
  onChange: (next: LeadFilterFormState) => void
  onApply: () => void
  onReset: () => void
}

export const initialLeadFilterForm: LeadFilterFormState = {
  city: '',
  postcodeArea: '',
  propertyType: '',
  sourcePlatform: '',
  minScore: '',
}

export function createLeadFilters(form: LeadFilterFormState): LeadsFilters {
  return {
    city: form.city || undefined,
    postcodeArea: form.postcodeArea || undefined,
    propertyType: form.propertyType || undefined,
    sourcePlatform: form.sourcePlatform || undefined,
    minScore: form.minScore ? Number(form.minScore) : undefined,
  }
}

export function LeadFilters({ form, onChange, onApply, onReset }: LeadFiltersProps) {
  const updateField = (field: keyof LeadFilterFormState, value: string) => {
    onChange({ ...form, [field]: value })
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_12px_40px_rgba(2,6,23,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
            Filters
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">Lead discovery criteria</h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg border border-cyan-400/30 bg-cyan-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            City
          </span>
          <input
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            placeholder="Manchester"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Postcode Area
          </span>
          <input
            value={form.postcodeArea}
            onChange={(event) => updateField('postcodeArea', event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            placeholder="M1"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Property Type
          </span>
          <input
            value={form.propertyType}
            onChange={(event) => updateField('propertyType', event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            placeholder="Flat"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Source Platform
          </span>
          <input
            value={form.sourcePlatform}
            onChange={(event) => updateField('sourcePlatform', event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            placeholder="Rightmove"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Min Score
          </span>
          <input
            type="number"
            min="0"
            value={form.minScore}
            onChange={(event) => updateField('minScore', event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            placeholder="70"
          />
        </label>
      </div>
    </section>
  )
}
