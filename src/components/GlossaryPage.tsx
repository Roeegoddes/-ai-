import { useMemo, useState, type ReactNode } from 'react'
import { glossary, glossaryCategories, type GlossaryCategory } from '../data/glossary'

type Props = {
  onBack: () => void
}

// Same palette as the curriculum's own modules — foundations/ML/neural-nets/
// LLM/generative/ethics. This is real wayfinding: a glossary category and a
// course module are, for six of the seven, literally the same thing.
const categoryColors: Record<GlossaryCategory, string> = {
  יסודות: '#34d399',
  'למידת מכונה': '#22d3ee',
  'רשתות נוירונים': '#8b5cf6',
  'שפה ו-LLM': '#f472b6',
  'AI גנרטיבי': '#fbbf24',
  'אתיקה ובטיחות': '#f87171',
  'תעשייה וכלים': '#9797b3',
}

const categoryIcons: Record<GlossaryCategory, string> = {
  יסודות: '🌱',
  'למידת מכונה': '🎯',
  'רשתות נוירונים': '🧠',
  'שפה ו-LLM': '💬',
  'AI גנרטיבי': '🎨',
  'אתיקה ובטיחות': '⚖️',
  'תעשייה וכלים': '🛠️',
}

// Most entries are "English (Hebrew gloss)" — split them so the two can carry
// distinct typographic weight instead of sitting in one undifferentiated
// string. Terms with no parenthetical (e.g. "Transformer") just have no gloss.
function splitTerm(term: string): { primary: string; translation: string | null } {
  const match = term.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
  if (!match) return { primary: term, translation: null }
  return { primary: match[1], translation: match[2] }
}

function highlightMatch(text: string, query: string): ReactNode {
  const q = query.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="bg-[color-mix(in_srgb,var(--color-brand)_35%,transparent)] text-[var(--color-text)] rounded-sm">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function GlossaryPage({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const q = query.trim().toLowerCase()
  const isSearching = q.length > 0

  const sections = useMemo(() => {
    const byCategory = new Map<GlossaryCategory, typeof glossary>()
    for (const cat of glossaryCategories) byCategory.set(cat, [])
    for (const entry of glossary) {
      if (activeCategory && entry.category !== activeCategory) continue
      if (q && !entry.term.toLowerCase().includes(q) && !entry.def.toLowerCase().includes(q)) continue
      byCategory.get(entry.category)!.push(entry)
    }
    for (const list of byCategory.values()) list.sort((a, b) => a.term.localeCompare(b.term, 'he'))
    return glossaryCategories
      .map((cat) => ({ category: cat, entries: byCategory.get(cat) ?? [] }))
      .filter((s) => s.entries.length > 0)
  }, [q, activeCategory])

  const totalMatches = sections.reduce((sum, s) => sum + s.entries.length, 0)
  const hasFilters = isSearching || activeCategory !== null

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function clearFilters() {
    setQuery('')
    setActiveCategory(null)
  }

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
          <span className="font-mono">{glossary.length}</span> מושגי מפתח, מאורגנים בדיוק כמו מסלול הלמידה עצמו — לפי נושא, מהיסודות ועד הכי מתקדם.
        </p>

        <div className="relative mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפשו מושג... (למשל: Transformer, הזיה, RAG)"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none focus:border-[var(--color-brand)] transition-colors"
          />
          {isSearching && (
            <span className="absolute end-4 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--color-text-faint)]">
              {totalMatches}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-9">
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
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer flex items-center gap-1.5"
              style={
                activeCategory === cat
                  ? { background: categoryColors[cat], borderColor: categoryColors[cat], color: '#0a0a12' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }
              }
            >
              <span>{categoryIcons[cat]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-text-faint)]">
            <div className="text-3xl mb-2">🔍</div>
            <p className="mb-4">לא נמצאו מושגים תואמים</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-[var(--color-brand-soft)] hover:text-[var(--color-brand)] transition-colors cursor-pointer underline underline-offset-4"
              >
                נקו את הסינון
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map(({ category, entries }) => (
              <section key={category}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-lg leading-none">{categoryIcons[category]}</span>
                  <h2 className="font-bold text-[15px]" style={{ color: categoryColors[category] }}>
                    {category}
                  </h2>
                  <span className="font-mono text-xs text-[var(--color-text-faint)]">{entries.length}</span>
                  {category === 'יסודות' && !hasFilters && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#0a0a12]"
                      style={{ background: categoryColors[category] }}
                    >
                      התחילו כאן
                    </span>
                  )}
                  <div
                    className="flex-1 h-px"
                    style={{ background: `color-mix(in srgb, ${categoryColors[category]} 25%, transparent)` }}
                  />
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] divide-y divide-[color-mix(in_srgb,var(--color-border)_65%,transparent)] overflow-hidden">
                  {entries.map((entry) => {
                    const key = `${entry.category}:${entry.term}`
                    const isOpen = isSearching || expanded.has(key)
                    const { primary, translation } = splitTerm(entry.term)
                    const accent = categoryColors[category]
                    return (
                      <div key={key}>
                        <button
                          onClick={() => toggle(key)}
                          disabled={isSearching}
                          className="w-full text-right flex items-center justify-between gap-3 px-4 py-2.5 border-e-2 transition-colors cursor-pointer disabled:cursor-default hover:bg-[var(--color-surface-hi)]"
                          style={{
                            borderInlineEndColor: isOpen ? accent : 'transparent',
                            background: isOpen ? `color-mix(in srgb, ${accent} 8%, var(--color-surface-hi))` : undefined,
                          }}
                        >
                          <span className="flex items-baseline gap-2.5 min-w-0">
                            <span className="font-mono font-bold text-[15px] shrink-0">{highlightMatch(primary, query)}</span>
                            {translation && (
                              <span className="text-[13px] text-[var(--color-text-faint)] truncate">
                                {highlightMatch(translation, query)}
                              </span>
                            )}
                          </span>
                          {!isSearching && (
                            <span
                              aria-hidden
                              className="shrink-0 transition-transform duration-200 text-xs"
                              style={{ color: isOpen ? accent : 'var(--color-text-faint)', transform: isOpen ? 'rotate(180deg)' : undefined }}
                            >
                              ⌄
                            </span>
                          )}
                        </button>
                        {isOpen && (
                          <div
                            className="px-4 py-4 border-e-2 animate-pop-in"
                            style={{
                              borderInlineEndColor: accent,
                              background: `color-mix(in srgb, ${accent} 4%, var(--color-surface-hi))`,
                            }}
                          >
                            <p className="text-[15px] text-[var(--color-text-dim)] leading-relaxed">
                              {highlightMatch(entry.def, query)}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
