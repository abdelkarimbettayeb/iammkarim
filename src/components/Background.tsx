'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes';

type AnimatedBoxProps = {
    position: [number, number, number]
    scale: [number, number, number]
    color: string
}
import { Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'


function AnimatedBox({ position, scale, color }: AnimatedBoxProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const pointer = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handlePointerMove = (event: MouseEvent) => {
            pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
            if (rigidBodyRef.current && !rigidBodyRef.current.isKinematic()) {
                const linVel = rigidBodyRef.current.linvel();
                rigidBodyRef.current.setLinvel({
                    x: linVel.x + pointer.current.x * 0.03,
                    y: linVel.y + pointer.current.y * 0.03,
                    z: linVel.z
                }, true);
            }
        };

        window.addEventListener('mousemove', handlePointerMove);
        return () => window.removeEventListener('mousemove', handlePointerMove);
    }, []);

    const rigidBodyRef = useRef<RapierRigidBody>(null)

    // // Add random velocity once on mount
    // useEffect(() => {
    //     if (!rigidBodyRef.current) return

    //     // Random linear and angular velocity
    //     rigidBodyRef.current.setLinvel({
    //         x: (Math.random() - 0.5) * 1,
    //         y: (Math.random() - 0.5) * 1,
    //         z: 0,
    //     }, true)

    //     rigidBodyRef.current.setAngvel({
    //         x: (Math.random() - 0.5) * 1,
    //         y: (Math.random() - 0.5) * 1,
    //         z: 0,
    //     }, true)
    // }, [])

    // move with mouse movement
    // useFrame(() => {
    //     const mesh = meshRef.current;
    //     if (!mesh || !pointer.current) return;

    //     // Faintly follow mouse movement (mouse.x/y is in range [-1, 1])
    //     // targetRotation.current.x = -pointer.current.y * 1.5;
    //     // targetRotation.current.y = pointer.current.x * 1.5;

    //     // // Smoothly interpolate rotation
    //     // mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotation.current.x, 0.5);
    //     // mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotation.current.y, 0.5);

    //     // smoothly add veclocity according to the mouse position (only if the the body is stationary)
    //     if (rigidBodyRef.current && !rigidBodyRef.current.isKinematic()) {
    //         const linVel = rigidBodyRef.current.linvel();
    //         rigidBodyRef.current.setLinvel({
    //             x: linVel.x + pointer.current.x * 0.1,
    //             y: linVel.y + pointer.current.y * 0.1,
    //             z: linVel.z
    //         }, true);
    //     }
    // });

    return (

        <RigidBody
            ref={rigidBodyRef}
            position={position}
            colliders="cuboid"
            restitution={1}
            friction={0.0}
            linearDamping={0}
            canSleep={false}
            angularDamping={0.1}
        >
            <mesh ref={meshRef} position={position} scale={scale}>
                <boxGeometry args={[1, 1, 1]} />.
                <meshPhysicalMaterial
                    metalness={0.1}
                    roughness={0.01}
                    reflectivity={10}
                    clearcoat={3.3}
                    color={new THREE.Color(color)}
                />
            </mesh>
        </RigidBody>
    )
}


function RandomShapes() {
    const windowsSize = useThree((state) => state.size);
    const scale = [2, 2, 2] as [number, number, number];
    return (
        <>
            <AnimatedBox key="key1"
                position={[windowsSize.width * 0.003, windowsSize.height * 0.00, 0]}
                scale={scale}
                color='#fa9f42' />

            <AnimatedBox
                position={[windowsSize.width * 0.000, windowsSize.height * 0.001, 0]}
                scale={scale}
                color='#fe64a3' />

            <AnimatedBox
                position={[windowsSize.width * 0.001, windowsSize.height * 0.00, 0]}
                scale={scale}
                color='#f3ffe1' />

            <AnimatedBox
                position={[windowsSize.width * -0.003, windowsSize.height * 0.00, 0]}
                scale={scale}
                color='#b3fa42' />

            <AnimatedBox
                position={[windowsSize.width * 0.000, windowsSize.height * -0.002, 0]}
                scale={scale}
                color='#fa9f42' />

        </>
    );
}


export default function BackgroundScene() {
    return (
        <div className=' blur-xl fixed top-0 left-0 w-[calc(100%-20px)] h-full'>
            <Canvas camera={{ position: [0, 0, 10], fov: 75, far: 100 }}>
                <Sky
                    distance={450000}
                    sunPosition={[100, 20, 100]}
                    inclination={0}
                    azimuth={0.25}
                    turbidity={8}
                    rayleigh={6}
                    mieCoefficient={0.005}
                    mieDirectionalG={0.8}
                />

                <ambientLight intensity={3} />
                <pointLight position={[10, 10, 10]} />
                <Physics gravity={[0, 0, 0]}>
                    <RandomShapes />
                    <BoundaryBox />
                </Physics>
            </Canvas>
        </div>
    )
}


function BoundaryBox() {
    const { theme } = useTheme();
    const color = theme === 'light' ? '#fff' : "#555";

    const size = 5; // how far from center
    const { height, width } = useThree((state) => state.size);
    const aspect = width / height;
    const size2 = size * aspect;

    const depth = 5000;

    return (
        <>
            {/* Six sides of a cube to enclose shapes */}
            {/* Top */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[0, size, 0]}>
                    <boxGeometry args={[size2 * 2, 1, depth]} />
                    <meshPhysicalMaterial
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>
            {/* Bottom */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[0, -size, 0]}>
                    <boxGeometry args={[size2 * 2, 1, depth]} />
                    <meshPhysicalMaterial
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>
            {/* Left */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[-size2, 0, 0]}>
                    <boxGeometry args={[1, size * 2, depth]} />
                    <meshPhysicalMaterial
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>
            {/* Right */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[size2, 0, 0]}>
                    <boxGeometry args={[1, size * 2, depth]} />
                    <meshPhysicalMaterial
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>

            {/* Front */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[0, 0, size]}>
                    <boxGeometry args={[size2 * 2, size * 2, 1]} />
                    <meshPhysicalMaterial
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        visible={false}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>

            {/* Back */}
            <RigidBody
                restitution={1}
                friction={0.0} linearDamping={0} angularDamping={0} type="fixed">
                <mesh position={[0, 0, -size]}>
                    <boxGeometry args={[size2 * 2, size * 2, 1]} />
                    <meshPhysicalMaterial
                        visible={false}
                        metalness={0.1}
                        roughness={0.01}
                        reflectivity={10}
                        clearcoat={3.3}
                        color={new THREE.Color(color)}
                    />
                </mesh>
            </RigidBody>
        </>
    );
}

