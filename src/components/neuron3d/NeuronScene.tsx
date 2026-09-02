import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RefObject } from 'react'
import { buildEdges, buildNodes, heroInputEdges, heroNode, type NodeSpec } from './networkLayout'

type Props = {
  progressRef: RefObject<number>
  moduleColor: string
  reducedMotion: boolean
}

const BG = '#0a0a12'

function smooth(edge0: number, edge1: number, x: number): number {
  return THREE.MathUtils.smoothstep(x, edge0, edge1)
}

type FrameBox = { center: THREE.Vector3; halfW: number; halfH: number }

function boundingFrame(points: THREE.Vector3[], center: THREE.Vector3): FrameBox {
  let halfW = 0
  let halfH = 0
  points.forEach((p) => {
    halfW = Math.max(halfW, Math.abs(p.x - center.x))
    halfH = Math.max(halfH, Math.abs(p.y - center.y))
  })
  return { center, halfW, halfH }
}

const BASE_FOV = 45
// Camera *distances* between beats are tuned once against this reference
// aspect and then kept fixed regardless of the viewer's actual screen shape
// — scene depth staying constant matters for fog/lighting. Narrow/portrait
// viewports instead get a wider lens (see neededFov below), not a camera
// pushed further back, which would blow past the fog's far distance and
// fade the whole scene to nothing.
const REFERENCE_ASPECT = 1.6

/** Camera distance to fit a halfW x halfH extent at REFERENCE_ASPECT. */
function fitDistance(halfW: number, halfH: number, margin = 1.3): number {
  const vFov = THREE.MathUtils.degToRad(BASE_FOV)
  const distForHeight = (halfH * margin) / Math.tan(vFov / 2)
  const distForWidth = (halfW * margin) / (Math.tan(vFov / 2) * REFERENCE_ASPECT)
  return Math.max(distForHeight, distForWidth)
}

/** Vertical FOV (degrees) needed to fit halfW x halfH at `dist`, for the given aspect. */
function neededFov(halfW: number, halfH: number, dist: number, aspect: number, margin = 1.3): number {
  const vFovForHeight = 2 * Math.atan((halfH * margin) / dist)
  const vFovForWidth = 2 * Math.atan((halfW * margin) / (dist * aspect))
  return THREE.MathUtils.radToDeg(Math.max(vFovForHeight, vFovForWidth))
}

export function NeuronScene({ progressRef, moduleColor, reducedMotion }: Props) {
  const color = useMemo(() => new THREE.Color(moduleColor), [moduleColor])
  const cyan = useMemo(() => new THREE.Color('#22d3ee'), [])
  const pink = useMemo(() => new THREE.Color('#f472b6'), [])

  const nodes = useMemo(() => buildNodes(), [])
  const edges = useMemo(() => buildEdges(nodes), [nodes])
  const hero = useMemo(() => heroNode(nodes), [nodes])
  const heroEdges = useMemo(() => heroInputEdges(nodes, edges), [nodes, edges])
  const inputs = nodes[0]

  const networkFrame = useMemo(() => {
    const all = nodes.flat().map((n) => new THREE.Vector3(n.x, n.y, n.z))
    const center = new THREE.Vector3()
    all.forEach((p) => center.add(p))
    center.divideScalar(all.length)
    return boundingFrame(all, center)
  }, [nodes])

  // Framing center for the intro/mechanism beats: the midpoint between the
  // hero neuron and the input layer's average position (not their plain
  // centroid, which — since the 4 close-together inputs outweigh the single
  // far-off hero — skews toward the inputs and pushes the hero off to one
  // side of frame, badly so on narrow/portrait aspect ratios).
  const heroFrame = useMemo(() => {
    const heroPos = new THREE.Vector3(hero.x, hero.y, hero.z)
    const inputPts = inputs.map((n) => new THREE.Vector3(n.x, n.y, n.z))
    const inputsAvg = new THREE.Vector3()
    inputPts.forEach((p) => inputsAvg.add(p))
    inputsAvg.divideScalar(inputPts.length)
    const center = heroPos.clone().lerp(inputsAvg, 0.5)
    return boundingFrame([heroPos, ...inputPts], center)
  }, [hero, inputs])

  const span = useMemo(() => layerXSpan(nodes), [nodes])
  const closeDist = useMemo(() => fitDistance(heroFrame.halfW, heroFrame.halfH), [heroFrame])
  const wideDist = useMemo(() => fitDistance(networkFrame.halfW, networkFrame.halfH), [networkFrame])
  const flyHalfW = useMemo(() => (span / (nodes.length - 1)) * 0.9, [span, nodes.length])
  const flyDist = useMemo(() => fitDistance(flyHalfW, networkFrame.halfH), [flyHalfW, networkFrame])

  const cameraTarget = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  const heroMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const heroMeshRef = useRef<THREE.Mesh>(null)
  const nodeMeshRefs = useRef<(THREE.Mesh | null)[]>([])
  const nodeMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const particleRefs = useRef<(THREE.Mesh | null)[]>([])
  const outputParticleRef = useRef<THREE.Mesh>(null)
  const outputMatRef = useRef<THREE.MeshStandardMaterial>(null)

  const heroLinesGeo = useMemo(() => {
    const positions = new Float32Array(heroEdges.length * 2 * 3)
    heroEdges.forEach((e, i) => {
      positions.set([e.from.x, e.from.y, e.from.z, e.to.x, e.to.y, e.to.z], i * 6)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [heroEdges])
  const heroLinesMatRef = useRef<THREE.LineBasicMaterial>(null)

  const networkLinesGeo = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3)
    const colors = new Float32Array(edges.length * 2 * 3)
    edges.forEach((e, i) => {
      positions.set([e.from.x, e.from.y, e.from.z, e.to.x, e.to.y, e.to.z], i * 6)
      const tint = e.weight >= 0 ? cyan : pink
      const intensity = 0.35 + 0.65 * Math.abs(e.weight)
      const c = color.clone().lerp(tint, 0.5).multiplyScalar(intensity)
      colors.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [edges, color, cyan, pink])
  const networkLinesMatRef = useRef<THREE.LineBasicMaterial>(null)

  useFrame(({ camera, clock, size }) => {
    const p = progressRef.current ?? 0
    const t = clock.getElapsedTime()
    const aspect = size.width / size.height

    const weightsReveal = smooth(0.14, 0.3, p)
    const sumProgress = smooth(0.32, 0.46, p)
    const fireBump = triangle(0.48, 0.55, 0.62, p)
    const firedHold = smooth(0.48, 0.55, p)
    const pullback = smooth(0.62, 0.8, p)
    const depth = smooth(0.8, 1, p)

    // --- camera --- (positions/distances are fixed, tuned once against a
    // reference aspect ratio; the lens widens on narrow/portrait viewports
    // instead — see the FOV block below — so scene depth stays constant and
    // fog/lighting don't need per-aspect tuning too)
    const idle = reducedMotion ? 0 : Math.sin(t * 0.35) * 0.06

    const closeCam = new THREE.Vector3(heroFrame.center.x, heroFrame.center.y + idle, heroFrame.center.z + closeDist)
    const wideCam = new THREE.Vector3(networkFrame.center.x, networkFrame.center.y + 1.1, networkFrame.center.z + wideDist)

    // Flythrough: look-at glides from the input layer to exactly the output
    // layer (never past it), camera trails behind by a fraction of the fit
    // distance so the network stays framed the whole time instead of flying
    // off into empty space once it reaches the last layer.
    const inputX = nodes[0][0].x
    const outputX = nodes[nodes.length - 1][0].x
    const flyLookX = THREE.MathUtils.lerp(inputX + span * 0.15, outputX, depth)
    const flyCam = new THREE.Vector3(flyLookX - flyDist * 0.4, networkFrame.center.y + 0.7, networkFrame.center.z + flyDist)

    cameraTarget.current.copy(closeCam).lerp(wideCam, pullback)
    cameraTarget.current.lerp(flyCam, depth)
    camera.position.lerp(cameraTarget.current, reducedMotion ? 1 : 0.14)

    lookTarget.current.copy(heroFrame.center).lerp(networkFrame.center, pullback)
    lookTarget.current.lerp(new THREE.Vector3(flyLookX, networkFrame.center.y, networkFrame.center.z), depth)
    camera.lookAt(lookTarget.current)

    // Widen the lens (never narrow it below BASE_FOV) so the currently
    // framed content still fits on aspect ratios far from REFERENCE_ASPECT
    // — narrow/portrait screens in particular — without touching distance.
    if (camera instanceof THREE.PerspectiveCamera) {
      const blendedHalfW = THREE.MathUtils.lerp(THREE.MathUtils.lerp(heroFrame.halfW, networkFrame.halfW, pullback), flyHalfW, depth)
      const blendedHalfH = THREE.MathUtils.lerp(THREE.MathUtils.lerp(heroFrame.halfH, networkFrame.halfH, pullback), networkFrame.halfH, depth)
      const dist = camera.position.distanceTo(lookTarget.current)
      const targetFov = Math.min(80, Math.max(BASE_FOV, neededFov(blendedHalfW, blendedHalfH, dist, aspect)))
      camera.fov = reducedMotion ? targetFov : THREE.MathUtils.lerp(camera.fov, targetFov, 0.2)
      camera.updateProjectionMatrix()
    }

    // --- hero neuron ---
    if (heroMeshRef.current) {
      const scale = 1 + fireBump * 0.55 - pullback * 0.35
      heroMeshRef.current.scale.setScalar(Math.max(0.55, scale))
    }
    if (heroMatRef.current) {
      heroMatRef.current.emissiveIntensity = 0.9 + fireBump * 2.2 + firedHold * 0.4
      heroMatRef.current.opacity = 1
    }

    // --- input nodes (mechanism view) ---
    inputs.forEach((_, i) => {
      const mesh = nodeMeshRefs.current[i]
      const mat = nodeMatRefs.current[i]
      if (mesh) mesh.scale.setScalar(THREE.MathUtils.lerp(1, 0.7, pullback))
      if (mat) mat.opacity = THREE.MathUtils.lerp(0.25 + weightsReveal * 0.75, 1, pullback)
    })

    // --- hero edges (bright, mechanism-only) ---
    if (heroLinesMatRef.current) {
      heroLinesMatRef.current.opacity = weightsReveal * (1 - pullback)
    }

    // --- full dense network (nodes fade/scale in on pullback) ---
    for (let idx = inputs.length; idx < nodeMeshRefs.current.length; idx++) {
      const mesh = nodeMeshRefs.current[idx]
      const mat = nodeMatRefs.current[idx]
      if (mesh) mesh.scale.setScalar(THREE.MathUtils.lerp(0.2, 1, pullback))
      if (mat) mat.opacity = pullback
    }
    if (networkLinesMatRef.current) {
      networkLinesMatRef.current.opacity = pullback * 0.55
    }

    // --- signal particles flowing input -> hero ---
    particleRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const stagger = i * 0.012
      const travel = smooth(0.32 + stagger, 0.46 + stagger, p)
      const from = new THREE.Vector3(inputs[i].x, inputs[i].y, inputs[i].z)
      const to = new THREE.Vector3(hero.x, hero.y, hero.z)
      mesh.position.copy(from).lerp(to, travel)
      const visible = sumProgress > 0.02 && sumProgress < 0.995 && pullback < 0.1
      mesh.visible = visible
    })

    // --- output particle firing outward ---
    if (outputParticleRef.current && outputMatRef.current) {
      const travel = smooth(0.5, 0.6, p)
      const from = new THREE.Vector3(hero.x, hero.y, hero.z)
      const to = new THREE.Vector3(hero.x + 1.6, hero.y + 0.1, hero.z)
      outputParticleRef.current.position.copy(from).lerp(to, travel)
      outputMatRef.current.opacity = firedHold * (1 - smooth(0.58, 0.66, p))
      outputParticleRef.current.visible = pullback < 0.1
    }
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 6, 22]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 4, 6]} intensity={40} color={moduleColor} />
      <pointLight position={[-4, -2, 4]} intensity={18} color="#22d3ee" />

      {/* hero neuron */}
      <mesh ref={heroMeshRef} position={[hero.x, hero.y, hero.z]}>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial ref={heroMatRef} color={moduleColor} emissive={moduleColor} transparent />
      </mesh>

      {/* all nodes (inputs rendered normally too, since they're layer 0 of the same graph) */}
      {nodes.flat().map((n: NodeSpec, i: number) => {
        if (n.id === hero.id) return null
        const isInput = n.layer === 0
        return (
          <mesh
            key={n.id}
            ref={(el) => {
              nodeMeshRefs.current[i] = el
            }}
            position={[n.x, n.y, n.z]}
          >
            <sphereGeometry args={[isInput ? 0.16 : 0.13, 20, 20]} />
            <meshStandardMaterial
              ref={(el) => {
                nodeMatRefs.current[i] = el
              }}
              color={isInput ? '#e8e8f2' : moduleColor}
              emissive={isInput ? '#e8e8f2' : moduleColor}
              emissiveIntensity={isInput ? 0.4 : 0.6}
              transparent
              opacity={isInput ? 1 : 0}
            />
          </mesh>
        )
      })}

      {/* signal particles: input -> hero */}
      {inputs.map((n, i) => (
        <mesh
          key={`p-${n.id}`}
          ref={(el) => {
            particleRefs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={2} />
        </mesh>
      ))}

      {/* output particle */}
      <mesh ref={outputParticleRef}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial ref={outputMatRef} color={moduleColor} emissive={moduleColor} emissiveIntensity={2.5} transparent opacity={0} />
      </mesh>

      <lineSegments geometry={heroLinesGeo}>
        <lineBasicMaterial ref={heroLinesMatRef} color={moduleColor} transparent opacity={0} />
      </lineSegments>

      <lineSegments geometry={networkLinesGeo}>
        <lineBasicMaterial ref={networkLinesMatRef} vertexColors transparent opacity={0} />
      </lineSegments>
    </>
  )
}

function triangle(start: number, peak: number, end: number, p: number): number {
  if (p <= start || p >= end) return 0
  if (p <= peak) return smooth(start, peak, p)
  return 1 - smooth(peak, end, p)
}

function layerXSpan(nodes: NodeSpec[][]): number {
  const xs = nodes.flat().map((n) => n.x)
  return Math.max(...xs) - Math.min(...xs)
}
