'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Stars } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'

function AnimatedTarget() {
  const mesh = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.x += delta * 0.18
    mesh.current.rotation.y += delta * 0.28
  })

  return (
    <Float speed={2.2} rotationIntensity={0.5} floatIntensity={1.3}>
      <mesh ref={mesh} position={[0, 0, 0]}>
        <torusGeometry args={[1.15, 0.16, 24, 120]} />
        <MeshDistortMaterial color="#F4C542" emissive="#3a2600" speed={1.2} distort={0.18} roughness={0.28} metalness={0.35} />
      </mesh>
      <mesh rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[0.75, 0.12, 24, 120]} />
        <MeshDistortMaterial color="#D71E33" emissive="#3b0610" speed={1.6} distort={0.14} roughness={0.3} metalness={0.25} />
      </mesh>
      <mesh rotation={[0.9, -0.1, 0.6]}>
        <torusGeometry args={[0.38, 0.09, 24, 96]} />
        <MeshDistortMaterial color="#2D80C2" emissive="#041f3b" speed={1.9} distort={0.12} roughness={0.2} metalness={0.45} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.16, 48, 48]} />
        <meshStandardMaterial color="#8BC368" emissive="#24451b" roughness={0.25} metalness={0.15} />
      </mesh>
    </Float>
  )
}

export default function RangeScene() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 1.6]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 4, 4]} intensity={28} color="#F4C542" />
        <pointLight position={[-4, -2, 3]} intensity={12} color="#2D80C2" />
        <Stars radius={42} depth={18} count={900} factor={3.4} saturation={0} fade speed={0.45} />
        <AnimatedTarget />
      </Canvas>
    </div>
  )
}
