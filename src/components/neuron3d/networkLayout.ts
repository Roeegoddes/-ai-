// Deterministic procedural layout for the neuron/network 3D scene.
// No external model or randomness library — plain math so the layout is
// stable across renders and cheap to recompute.

export type NodeSpec = {
  id: string
  layer: number
  indexInLayer: number
  x: number
  y: number
  z: number
}

export type EdgeSpec = {
  from: NodeSpec
  to: NodeSpec
  /** -1..1, deterministic per-edge "weight" used to drive line opacity/color. */
  weight: number
}

export const LAYER_SIZES = [4, 6, 6, 2] as const
const LAYER_LABELS = ['קלט', 'חבויה 1', 'חבויה 2', 'פלט'] as const

const LAYER_SPACING = 3.4
const NODE_GAP = 1.05

// Small deterministic hash -> [0,1), used instead of Math.random() so the
// layout/weights never jitter between renders.
function hash(a: number, b: number): number {
  const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
  return s - Math.floor(s)
}

export function buildNodes(): NodeSpec[][] {
  const centerX = ((LAYER_SIZES.length - 1) * LAYER_SPACING) / 2
  return LAYER_SIZES.map((size, layer) => {
    const centerY = ((size - 1) * NODE_GAP) / 2
    return Array.from({ length: size }, (_, i) => ({
      id: `${layer}-${i}`,
      layer,
      indexInLayer: i,
      x: layer * LAYER_SPACING - centerX,
      y: i * NODE_GAP - centerY,
      z: (hash(layer, i) - 0.5) * 0.9,
    }))
  })
}

export function buildEdges(nodes: NodeSpec[][]): EdgeSpec[] {
  const edges: EdgeSpec[] = []
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const from of nodes[l]) {
      for (const to of nodes[l + 1]) {
        edges.push({ from, to, weight: hash(from.layer * 31 + from.indexInLayer, to.indexInLayer + 7) * 2 - 1 })
      }
    }
  }
  return edges
}

export function layerLabel(layer: number): string {
  return LAYER_LABELS[layer] ?? ''
}

/** The single hidden-layer neuron used as the "hero" for the intro/mechanism beats. */
export function heroNode(nodes: NodeSpec[][]): NodeSpec {
  return nodes[1][2]
}

/** The hero's own inbound edges from the input layer, used for the weights/sum beats. */
export function heroInputEdges(nodes: NodeSpec[][], edges: EdgeSpec[]): EdgeSpec[] {
  const hero = heroNode(nodes)
  return edges.filter((e) => e.to.id === hero.id)
}
