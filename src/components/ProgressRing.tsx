type Props = {
  value: number // 0-1
  size?: number
  strokeWidth?: number
  color?: string
  children?: React.ReactNode
}

export function ProgressRing({ value, size = 56, strokeWidth = 5, color = '#8b5cf6', children }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(value, 0), 1))

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-hi)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{children}</div>
      )}
    </div>
  )
}
