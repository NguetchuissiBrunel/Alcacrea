export function BackgroundWaves() {
  return (
    <div className="wave-bg-layers" aria-hidden="true">
      {/* Couche remplie — vagues larges */}
      <svg className="wave-layer wave-layer-fill-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          d="M0,160 C240,80 480,240 720,160 S1200,80 1440,160 L1440,320 L0,320 Z"
          fill="var(--color-breath)"
        />
      </svg>

      <svg className="wave-layer wave-layer-fill-2" viewBox="0 0 1440 280" preserveAspectRatio="none">
        <path
          d="M0,140 C360,220 540,60 900,140 S1260,220 1440,140 L1440,280 L0,280 Z"
          fill="var(--color-dream)"
        />
      </svg>

      {/* Traits de tracé — style polygraphie */}
      <svg className="wave-layer wave-layer-line-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          d="M0,60 C90,20 180,100 270,60 S450,20 540,60 S630,100 720,60 S810,20 900,60 S990,100 1080,60 S1170,20 1260,60 S1350,100 1440,60"
          fill="none"
          stroke="var(--color-breath)"
          strokeWidth="2"
        />
        <path
          d="M0,75 C120,95 240,45 360,75 S480,95 600,75 S720,45 840,75 S960,95 1080,75 S1200,45 1320,75 S1380,90 1440,75"
          fill="none"
          stroke="var(--color-dream)"
          strokeWidth="1.2"
        />
      </svg>

      <svg className="wave-layer wave-layer-line-2" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          d="M0,50 C100,15 200,85 300,50 S500,15 600,50 S700,85 800,50 S900,15 1000,50 S1100,85 1200,50 S1300,15 1440,50"
          fill="none"
          stroke="var(--color-pulse)"
          strokeWidth="1.4"
        />
        <path
          d="M0,65 C150,40 300,80 450,55 S600,30 750,65 S900,90 1050,55 S1200,30 1350,65 S1380,50 1440,50"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="0.9"
        />
      </svg>

      <svg className="wave-layer wave-layer-line-3" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path
          d="M0,40 Q180,10 360,40 T720,40 T1080,40 T1440,40"
          fill="none"
          stroke="var(--color-breath)"
          strokeWidth="1.8"
        />
        <path
          d="M0,52 Q200,72 400,52 T800,52 T1200,52 T1440,52"
          fill="none"
          stroke="var(--color-dream)"
          strokeWidth="1"
        />
        <path
          d="M0,30 Q160,55 320,30 T640,30 T960,30 T1280,30 T1440,30"
          fill="none"
          stroke="var(--color-pulse)"
          strokeWidth="0.7"
          opacity="0.7"
        />
      </svg>

      {/* Vagues bas de page — plus marquées */}
      <svg className="wave-layer wave-layer-bottom" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path
          d="M0,80 C180,30 360,130 540,80 S900,30 1080,80 S1260,130 1440,80 L1440,160 L0,160 Z"
          fill="var(--color-breath)"
        />
        <path
          d="M0,100 Q180,130 360,100 T720,100 T1080,100 T1440,100"
          fill="none"
          stroke="var(--color-dream)"
          strokeWidth="2"
        />
        <path
          d="M0,110 Q240,80 480,110 T960,110 T1440,110"
          fill="none"
          stroke="var(--color-pulse)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  )
}
