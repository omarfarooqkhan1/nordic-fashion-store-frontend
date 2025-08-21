import React, { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export interface JacketModelProps {
	bodyColor: string;
	leftArmColor?: string;
	rightArmColor?: string;
	scale?: number | [number, number, number];
	position?: [number, number, number];
	rotation?: [number, number, number];
}

// Loads /models/jacket.glb from public and applies basic materials.
// Drop your GLB at public/models/jacket.glb
const JacketModel: React.FC<JacketModelProps> = ({
	bodyColor,
	leftArmColor,
	rightArmColor,
	scale = 1,
	position = [Math.PI / 2, 0, 0],
	rotation = [0, 0, 0]
}) => {
	// Type as any to avoid strict typing issues with GLTF typings
	const gltf: any = useGLTF('/models/jacket.glb');

	const bodyMat = useMemo(
		() => new THREE.MeshStandardMaterial({ color: new THREE.Color(bodyColor), roughness: 0.55, metalness: 0.1 }),
		[bodyColor]
	);
	const leftMat = useMemo(
		() =>
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(leftArmColor || bodyColor),
				roughness: 0.55,
				metalness: 0.1
			}),
		[leftArmColor, bodyColor]
	);
	const rightMat = useMemo(
		() =>
			new THREE.MeshStandardMaterial({
				color: new THREE.Color(rightArmColor || bodyColor),
				roughness: 0.55,
				metalness: 0.1
			}),
		[rightArmColor, bodyColor]
	);

	useEffect(() => {
		if (!gltf?.scene) return;
		gltf.scene.traverse((obj: any) => {
			if (obj.isMesh) {
				obj.castShadow = true;
				obj.receiveShadow = true;
				const name = (obj.name || '').toLowerCase();
				if (name.includes('left') && leftArmColor) obj.material = leftMat;
				else if (name.includes('right') && rightArmColor) obj.material = rightMat;
				else if (!obj.material || obj.material.isMeshStandardMaterial) obj.material = bodyMat;
			}
		});
	}, [gltf, bodyMat, leftMat, rightMat, leftArmColor, rightArmColor]);

	if (!gltf?.scene) return null;

	return (
		<primitive
			object={gltf.scene}
			scale={scale as any}
			position={position as any}
			rotation={rotation as any}
		/>
	);
};

export default JacketModel;

// Preload default path
useGLTF.preload('/models/jacket.glb');
 
