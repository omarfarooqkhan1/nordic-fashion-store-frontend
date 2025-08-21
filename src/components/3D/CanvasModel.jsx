import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Center, Html, useProgress, OrbitControls } from '@react-three/drei'
import JacketFBX from './JacketFBX'

const Loader = () => {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="text-sm font-medium text-gray-800">{Math.round(progress)}%</div>
    </Html>
  )
}

const CanvasModel = ({ bodyColor, leftArmColor, rightArmColor, variant = 'closed' }) => {
  return (
    <Canvas shadows camera={{ position: [0, 0, 2.8], fov: 30 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} castShadow intensity={1.2} />
      <Suspense fallback={<Loader />}>
        <Environment preset="city" />
        <Center>
          <JacketFBX bodyColor={bodyColor} leftArmColor={leftArmColor} rightArmColor={rightArmColor} variant={variant} scale={0.01} />
        </Center>
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

export default CanvasModel

// Old experimental implementations removed