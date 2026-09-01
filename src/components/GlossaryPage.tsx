import { useMemo, useState } from 'react'
import { glossary, glossaryCategories, type GlossaryCategory } from '../data/glossary'

type Props = {
  onBack: () => void
}

const categoryColors: Record<GlossaryCategory, string> = {
  יסודות: '#34d399',
  'למידת מכונה': '#22d3ee',
  'רשתות נוירונים': '#8b5cf6',
  'שפה ו-LLM': '#f472b6',
  'AI גנרטיבי': '#fbbf24',
  'אתיקה ובטיחות': '#f87171',
  'תעשייה וכלים': '#9797b3',
}

export function GlossaryPage({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return glossary
      .filter((entry) => !activeCategory || entry.category === activeCategory)
      .filter((entry) => !q || entry.term.toLowerCase().includes(q) || entry.def.toLowerCase().includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, 'he'))
  }, [query, activeCategory])

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <button
          onClick={onBack}
          className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)] transition-colors mb-6 flex items-center gap-1.5 cursor-pointer"
        >
          <span>→</span> חזרה למסלול הלמידה
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <h1 className="text-3xl font-extrabold leading-tight">מילון מושגי AI</h1>
        </div>
        <p className="text-[var(--color-text-dim)] mb-6">
          {glossary.length} מושגי מפתח מכל עולם הבינה המלאכותית, במקום אחד — לחפש, לסנן ולרענן זיכרון.
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפשו מושג... (למשל: Transformer, הזיה, RAG)"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none focus:border-[var(--color-brand)] transition-colors mb-4"
        />

        <div className="flex items-center gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              activeCategory === null
                ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-brand)]'
            }`}
          >
            הכל
          </button>
          {glossaryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory((c) => (c === cat ? null : cat))}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
              style={
                activeCategory === cat
                  ? { background: categoryColors[cat], borderColor: categoryColors[cat], color: '#0a0a12' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-faint)]">
            <div className="text-3xl mb-2">🔍</div>
            לא נמצאו מושגים תואמים
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.map((entry) => (
              <div
                key={entry.term}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: categoryColors[entry.category] }}
                  />
                  <span className="font-semibold text-sm">{entry.term}</span>
                </div>
                <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{entry.def}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
