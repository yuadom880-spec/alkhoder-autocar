import { copy } from '../../lib/copy'

function BrandChip({
  name,
  className,
  labelClassName,
}: {
  name: 'tabby' | 'tamara'
  className: string
  labelClassName: string
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-black tracking-tight ${className}`}
    >
      <span className={labelClassName}>{name}</span>
    </span>
  )
}

export function InstallmentPaymentNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-brand-green/25 bg-gradient-to-l from-brand-green/8 to-violet-500/5 ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="rounded-full bg-brand-green/15 px-2.5 py-0.5 text-[11px] font-bold text-brand-green">
          {copy.installment.badge}
        </span>
        <BrandChip
          name="tabby"
          className="bg-[#3BFFC1] text-[#111]"
          labelClassName="lowercase"
        />
        <BrandChip
          name="tamara"
          className="bg-[#F8F5FF] text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500"
          labelClassName="lowercase"
        />
      </div>
      <p className={`font-bold text-brand-dark ${compact ? 'text-sm' : 'text-base'}`}>
        {copy.installment.bookingTitle}
      </p>
      <p className={`mt-1 text-slate-600 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
        {copy.installment.bookingSub}
      </p>
    </div>
  )
}