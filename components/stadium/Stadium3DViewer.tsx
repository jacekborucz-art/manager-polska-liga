import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
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
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true, stencil: false, depth: true, alpha: true }}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #4598cc 0%, #72b7df 52%, #b6dff2 100%)',
      }}
    >
      <PerspectiveCamera makeDefault position={[118, 92, 132]} fov={46} near={0.1} far={700} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        target={[0, -2, 0]}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.18}
        minDistance={72}
        maxDistance={250}
        makeDefault
      />
      <Suspense fallback={null}>
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
