import React, { useRef, useEffect, useState } from 'react';
import { useFBX, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export interface JacketGLTFProps {
  bodyColor: string;
  leftArmColor?: string;
  rightArmColor?: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  view?: 'front' | 'back';
}

const JacketGLTF: React.FC<JacketGLTFProps> = ({
  bodyColor,
  leftArmColor,
  rightArmColor,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  view = 'front'
}) => {
  const group = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [autoScale, setAutoScale] = useState(1);
  const [autoPosition, setAutoPosition] = useState([0, 0, 0]);

  // Load leather textures from the models/textures folder
  const jacketTextures = useTexture({
    normalMap: '/models/textures/Jacket_low_normal.jpg',
    roughnessMap: '/models/textures/Jacket_low_roughness.jpg',
    aoMap: '/models/textures/Jacket_low_AO.jpg',
    metallicMap: '/models/textures/Jacket_low_metallic.jpg'
  });

  const borderLTextures = useTexture({
    normalMap: '/models/textures/Border_L_low_normal.jpg',
    roughnessMap: '/models/textures/Border_L_low_roughness.jpg',
    aoMap: '/models/textures/Border_L_low_AO.jpg',
    metallicMap: '/models/textures/Border_L_low_metallic.jpg'
  });

  const borderRTextures = useTexture({
    normalMap: '/models/textures/Border_R_low_normal.jpg',
    roughnessMap: '/models/textures/Border_R_low_roughness.jpg',
    aoMap: '/models/textures/Border_R_low_AO.jpg',
    metallicMap: '/models/textures/Border_R_low_metallic.jpg'
  });

  const stitchesTextures = useTexture({
    normalMap: '/models/textures/Stitches_low_normal.jpg',
    roughnessMap: '/models/textures/Stitches_low_roughness.jpg',
    aoMap: '/models/textures/Stitches_low_AO.jpg',
    metallicMap: '/models/textures/Stitches_low_metallic.jpg'
  });

  const zipperTextures = useTexture({
    normalMap: '/models/textures/Zipper_low_normal.jpg',
    roughnessMap: '/models/textures/Zipper_low_roughness.jpg',
    aoMap: '/models/textures/Zipper_low_AO.jpg',
    metallicMap: '/models/textures/Zipper_low_metallic.jpg'
  });

  // Load new FBX model
  const fbx = useFBX('/models/model.fbx');

  // Debug: Log every time colors change
  useEffect(() => {
    console.log('🎨 Color props changed:', { bodyColor, leftArmColor, rightArmColor });
  }, [bodyColor, leftArmColor, rightArmColor]);

  useEffect(() => {
    if (fbx) {
      console.log('🎯 Processing new FBX model...');
      setModelLoaded(true);
      
      // Log model information for debugging
      console.log('🎯 New Leather Jacket FBX loaded:', fbx);
      console.log('📏 Model scale:', scale);
      console.log('📍 Model position:', position);
      console.log('🎨 Colors to apply:', { bodyColor, leftArmColor, rightArmColor });
      
      // Get model bounds for centering and auto-scaling
      try {
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        console.log('📦 Model bounds:', {
          size: size.toArray(),
          center: center.toArray(),
          min: box.min.toArray(),
          max: box.max.toArray()
        });
        
        // Auto-scale large models
        if (size.x > 100 || size.y > 100 || size.z > 100) {
          console.log('⚠️ Model is very large, auto-scaling down');
          setAutoScale(0.01); // Scale down by 100x
        } else if (size.x < 0.1 || size.y < 0.1 || size.z < 0.1) {
          console.log('⚠️ Model is very small, auto-scaling up');
          setAutoScale(100); // Scale up by 100x
        }
        
        // Auto-position to center
        if (Math.abs(center.x) > 10 || Math.abs(center.y) > 10 || Math.abs(center.z) > 10) {
          console.log('⚠️ Model is far from center, auto-centering');
          const newPosition = [-center.x * autoScale, -center.y * autoScale, -center.z * autoScale];
          setAutoPosition(newPosition);
          console.log('📍 Auto-position:', newPosition);
        }
        
      } catch (error) {
        console.error('❌ Error calculating model bounds:', error);
      }
      
      // Apply colors and setup materials with proper leather textures
      try {
        let meshCount = 0;
        let materialCount = 0;
        
        fbx.traverse((obj: any) => {
          if (obj.isMesh) {
            meshCount++;
            obj.castShadow = true;
            obj.receiveShadow = true;
            
            console.log(`🔍 Processing mesh: "${obj.name || 'unnamed'}"`);
            console.log(`   - Position: ${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)}`);
            console.log(`   - Scale: ${obj.scale.x.toFixed(2)}, ${obj.scale.y.toFixed(2)}, ${obj.scale.z.toFixed(2)}`);
            console.log(`   - Geometry vertices: ${obj.geometry.attributes.position.count}`);
            
            // For now, let's use body color for everything to see the base behavior
            let appliedColor = bodyColor;
            let colorType = 'body (all meshes)';
            let textures = jacketTextures; // Use main jacket textures for all meshes
            
            // Apply proper colors based on actual mesh names
            const meshName = obj.name || '';
            
            if (meshName.includes('Border_L_low')) {
              // Left border - keep as body color
              appliedColor = bodyColor;
              colorType = 'left border (body color)';
              textures = borderLTextures;
            } else if (meshName.includes('Border_R_low')) {
              // Right border - keep as body color  
              appliedColor = bodyColor;
              colorType = 'right border (body color)';
              textures = borderRTextures;
            } else if (meshName.includes('Stitches_low')) {
              // Stitches - use stitch textures
              appliedColor = bodyColor;
              colorType = 'stitches';
              textures = stitchesTextures;
            } else if (meshName.includes('Zipper_low')) {
              // Zipper - use zipper textures
              appliedColor = bodyColor;
              colorType = 'zipper';
              textures = zipperTextures;
            } else if (meshName.includes('Jacket_low')) {
              // Main jacket - use body color for entire jacket
              appliedColor = bodyColor;
              colorType = 'main jacket (body color)';
              textures = jacketTextures;
            } else {
              // Default case - use body color and jacket textures
              appliedColor = bodyColor;
              colorType = 'default (body color)';
              textures = jacketTextures;
            }
            
            // Create new material with leather textures and PBR properties
            const newMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color(appliedColor),
              normalMap: textures.normalMap,
              roughnessMap: textures.roughnessMap,
              aoMap: textures.aoMap,
              metalnessMap: textures.metallicMap,
              roughness: 0.8,
              metalness: 0.1,
              normalScale: new THREE.Vector2(1, 1),
              transparent: false,
              opacity: 1.0
            });
            
            // Apply the new material
            obj.material = newMaterial;
            materialCount++;
            
            console.log(`✅ Applied ${colorType} color: ${appliedColor} to mesh "${obj.name || 'unnamed'}"`);
            
          }
        });
        
        console.log(`📊 Processed ${meshCount} meshes and ${materialCount} materials with leather textures`);
        
        // Log mesh names for debugging
        console.log('✅ New Leather Jacket FBX loaded successfully with leather textures!');
        const meshNames: string[] = [];
        fbx.traverse((obj: any) => {
          if (obj.isMesh) {
            meshNames.push(obj.name || 'unnamed');
          }
        });
        console.log('📋 All mesh names:', meshNames);
        
      } catch (error) {
        console.error('❌ Error processing materials with textures:', error);
      }
    }
  }, [fbx, bodyColor, leftArmColor, rightArmColor, scale, position, autoScale, jacketTextures, borderLTextures, borderRTextures, stitchesTextures, zipperTextures]);

  // Show loading state
  if (!modelLoaded) {
    return (
      <Html center>
        <div className="text-center">
          <div className="text-blue-600 text-sm font-medium mb-2">Loading New Leather Jacket...</div>
          <div className="text-gray-600 text-xs">Please wait</div>
        </div>
      </Html>
    );
  }

  // Render FBX model with auto-scaling and positioning
  if (fbx && modelLoaded) {
    const finalScale = typeof scale === 'number' ? scale * autoScale : [scale[0] * autoScale, scale[1] * autoScale, scale[2] * autoScale];
    const finalPosition = [
      position[0] + autoPosition[0],
      position[1] + autoPosition[1], 
      position[2] + autoPosition[2]
    ];
    
    // Adjust rotation based on view
    let finalRotation: [number, number, number];
    if (view === 'back') {
      // For back view, rotate -90 degrees around X axis
      finalRotation = [Math.PI/2, -Math.PI, 0];
    } else {
      // For front view, use the standard rotation
      finalRotation = [Math.PI/2, Math.PI, 0];
    }
    
    console.log('🎯 Rendering FBX with:', { finalScale, finalPosition, finalRotation, view });
    
    return (
      <primitive 
        object={fbx} 
        ref={group}
        scale={finalScale}
        position={finalPosition}
        rotation={finalRotation}
      />
    );
  }

  // Fallback to simple primitives if nothing else works
  return (
    <group ref={group} scale={scale} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.8, 0.3]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.8} 
          metalness={0.1}
          normalMap={jacketTextures.normalMap}
          roughnessMap={jacketTextures.roughnessMap}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.8, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 8]} />
        <meshStandardMaterial 
          color={leftArmColor || bodyColor} 
          roughness={0.8} 
          metalness={0.1}
          normalMap={jacketTextures.normalMap}
          roughnessMap={jacketTextures.roughnessMap}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0.8, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 8]} />
        <meshStandardMaterial 
          color={rightArmColor || bodyColor} 
          roughness={0.8} 
          metalness={0.1}
          normalMap={jacketTextures.normalMap}
          roughnessMap={jacketTextures.roughnessMap}
        />
      </mesh>
    </group>
  );
};

export default JacketGLTF;

// Preload the new FBX model for better performance
useFBX.preload('/models/model.fbx');
