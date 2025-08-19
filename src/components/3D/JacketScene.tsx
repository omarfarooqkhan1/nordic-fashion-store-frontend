import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Html, useProgress } from '@react-three/drei';
import JacketGLTF from './JacketFBX';

interface JacketSceneProps {
  bodyColor: string;
  leftArmColor?: string;
  rightArmColor?: string;
  view?: 'front' | 'back';
}

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-sm font-medium text-gray-800">{Math.round(progress)}%</div>
    </Html>
  );
};

const JacketScene: React.FC<JacketSceneProps> = ({ bodyColor, leftArmColor, rightArmColor, view = 'front' }) => {
  // Camera position based on view
  const getCameraPosition = (): [number, number, number] => {
    if (view === 'back') {
      return [0, 0.5, -5.27]; // Camera behind the jacket at 120% zoom
    }
    return [0, 0.5, 5.27]; // Camera in front of the jacket at 120% zoom
  };

  // Enhanced lighting for back view
  const getLighting = () => {
    if (view === 'back') {
      return (
        <>
          {/* Brighter ambient light for back view */}
          <ambientLight intensity={2.0} />
          
          {/* Main directional lights for back view */}
          <directionalLight position={[0, 2, -3]} intensity={1.5} castShadow />
          <directionalLight position={[0, -2, -3]} intensity={1.3} castShadow />
          
          {/* Side lighting for back view */}
          <directionalLight position={[3, 0, -2]} intensity={1.0} castShadow />
          <directionalLight position={[-3, 0, -2]} intensity={1.0} castShadow />
          
          {/* Top and bottom lighting for back view */}
          <directionalLight position={[0, 4, -1]} intensity={0.8} castShadow />
          <directionalLight position={[0, -4, -1]} intensity={0.8} castShadow />
          
          {/* Additional fill lights for back view */}
          <directionalLight position={[2, 1, -1]} intensity={0.6} />
          <directionalLight position={[-2, 1, -1]} intensity={0.6} />
          
          {/* Extra bright lights specifically for back view */}
          <directionalLight position={[0, 1, -4]} intensity={1.0} />
          <directionalLight position={[1, 0, -3]} intensity={0.7} />
          <directionalLight position={[-1, 0, -3]} intensity={0.7} />
        </>
      );
    }
    
    // Standard lighting for front view
    return (
      <>
        <ambientLight intensity={2.0} />
        <directionalLight position={[2, 2, 3]} intensity={1.5} castShadow />
        <directionalLight position={[-2, 2, 3]} intensity={1.5} castShadow />
        <directionalLight position={[0, 3, 2]} intensity={1.2} castShadow />
        <directionalLight position={[0, -2, 2]} intensity={1.2} castShadow />
        <directionalLight position={[2, 0, -2]} intensity={1.0} castShadow />
        <directionalLight position={[-2, 0, -2]} intensity={1.0} castShadow />
        
        {/* Additional fill lights for front view */}
        <directionalLight position={[0, 1, 4]} intensity={1.0} />
        <directionalLight position={[1, 0, 3]} intensity={0.7} />
        <directionalLight position={[-1, 0, 3]} intensity={0.7} />
      </>
    );
  };

  // Attach native webglcontextlost handler to Canvas
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;
    const handler = (e: Event) => {
      e.preventDefault();
      alert('WebGL context was lost. Please reload the page.');
      console.error('WebGL context lost:', e);
    };
    canvas.addEventListener('webglcontextlost', handler, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', handler, false);
    };
  }, [view]);

  return (
    <div ref={canvasWrapperRef} className="w-full h-96 rounded-lg overflow-hidden bg-gradient-to-b from-gray-100 to-gray-300">
      <Canvas camera={{ position: getCameraPosition(), fov: 25 }}>
        {getLighting()}
        <Suspense fallback={<Loader />}>
          <Center>
            <JacketGLTF
              bodyColor={bodyColor}
              leftArmColor={leftArmColor}
              rightArmColor={rightArmColor}
              scale={1.0}
              view={view}
            />
          </Center>
        </Suspense>
        <OrbitControls 
          enablePan={false} 
          enableRotate={false}
          enableZoom={false}
          minDistance={5.27}
          maxDistance={5.27}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default JacketScene;