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

const inputClasses =
  'w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

const labelClasses = 'mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500'

export function LeadFilters({ form, onChange, onApply, onReset }: LeadFiltersProps) {
  const updateField = (field: keyof LeadFilterFormState, value: string) => {
    onChange({ ...form, [field]: value })
  }

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Screening criteria</h3>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onApply}
            className="rounded-sm bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-sm border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="block min-w-0">
          <span className={labelClasses}>City</span>
          <input
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            className={inputClasses}
            placeholder="Manchester"
          />
        </label>

        <label className="block min-w-0">
          <span className={labelClasses}>Postcode area</span>
          <input
            value={form.postcodeArea}
            onChange={(event) => updateField('postcodeArea', event.target.value)}
            className={inputClasses}
            placeholder="M1"
          />
        </label>

        <label className="block min-w-0">
          <span className={labelClasses}>Property type</span>
          <input
            value={form.propertyType}
            onChange={(event) => updateField('propertyType', event.target.value)}
            className={inputClasses}
            placeholder="Flat"
          />
        </label>

        <label className="block min-w-0">
          <span className={labelClasses}>Source platform</span>
          <input
            value={form.sourcePlatform}
            onChange={(event) => updateField('sourcePlatform', event.target.value)}
            className={inputClasses}
            placeholder="Rightmove"
          />
        </label>

        <label className="block min-w-0">
          <span className={labelClasses}>Min score</span>
          <input
            type="number"
            min="0"
            value={form.minScore}
            onChange={(event) => updateField('minScore', event.target.value)}
            className={inputClasses}
            placeholder="70"
          />
        </label>
      </div>
    </section>
  )
}
