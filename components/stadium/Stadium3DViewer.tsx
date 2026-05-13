import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { Pitch } from './3d/Pitch';
import { Lighting } from './3d/Lighting';
import { Surroundings } from './3d/Surroundings';
import { VerySmallStands } from './3d/VerySmallStands';
import { SmallRegionalStands } from './3d/SmallRegionalStands';
import { SmallStands } from './3d/SmallStands';
import { LargeStands } from './3d/LargeStands';
import { LargerStands } from './3d/LargerStands';
import { MediumStands } from './3d/MediumStands';
import { HighBowlStands } from './3d/HighBowlStands';
import { ColossalStands } from './3d/ColossalStands';

type StadiumType = 'very-small' | 'small-regional' | 'small' | 'large' | 'larger' | 'medium' | 'high-bowl' | 'colossal';

function getStadiumType(capacity: number): StadiumType {
  if (capacity <= 2000)  return 'very-small';
  if (capacity <= 5000)  return 'small-regional';
  if (capacity <= 8000)  return 'small';
  if (capacity <= 15000) return 'large';
  if (capacity <= 22000) return 'larger';
  if (capacity <= 30000) return 'medium';
  if (capacity <= 60000) return 'high-bowl';
  return 'colossal';
}

interface Stadium3DViewerProps {
  capacity: number;
  primaryColor?: string;
  seatColors?: string[];
}

export function Stadium3DViewer({ capacity, primaryColor, seatColors }: Stadium3DViewerProps) {
  const stadiumType = getStadiumType(capacity);
  const seatColor: string | string[] = seatColors && seatColors.length > 0 ? seatColors : (primaryColor ?? '#1a3a6a');

  return (
    <Canvas shadows gl={{ antialias: true, stencil: false, depth: true }} style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[-50, 30, 80]} fov={40} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={30}
        maxDistance={180}
        makeDefault
      />
      <color attach="background" args={['#5aa0d8']} />
      <Suspense fallback={null}>
        <Sky
          distance={450000}
          sunPosition={[10, 20, 10]}
          turbidity={3}
          rayleigh={4}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <Environment preset="city" />
        <group position={[0, -5, 0]}>
          <Pitch />
          {stadiumType === 'very-small'    && <VerySmallStands    seatColor={seatColor} />}
          {stadiumType === 'small-regional' && <SmallRegionalStands seatColor={seatColor} />}
          {stadiumType === 'small'         && <SmallStands         seatColor={seatColor} />}
          {stadiumType === 'large'         && <LargeStands         seatColor={seatColor} />}
          {stadiumType === 'larger'        && <LargerStands        seatColor={seatColor} />}
          {stadiumType === 'medium'        && <MediumStands        seatColor={seatColor} />}
          {stadiumType === 'high-bowl'     && <HighBowlStands      seatColor={seatColor} />}
          {stadiumType === 'colossal'      && <ColossalStands      seatColor={seatColor} />}
          <Lighting stadiumType={stadiumType} />
          <Surroundings />
        </group>
        <ContactShadows resolution={1024} scale={200} blur={2} opacity={0.3} far={20} color="#000000" />
      </Suspense>
      <fog attach="fog" args={['#0a0c10', 50, 400]} />
    </Canvas>
  );
}
