import { DoubleSide } from 'three';

export function SmallStands({ seatColor = '#1a3a6a' }: { seatColor?: string | string[] }) {
  return (
    <group>
      <NorthStand seatColor={seatColor} />
      <SouthStand seatColor={seatColor} />
      <EastStand seatColor={seatColor} />
    </group>
  );
}

function NorthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={[0, 0, -48]}>
      <mesh position={[0, 9, -16]} castShadow receiveShadow>
        <boxGeometry args={[112, 18, 2]} />
        <meshStandardMaterial color="#2a2a2a" roughness={1} />
      </mesh>
      <group position={[0, 0, 7]}>
        {Array.from({ length: 22 }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 + 0.25, -i * 0.8]} castShadow receiveShadow>
            <boxGeometry args={[110, 0.5, 1]} />
            <meshStandardMaterial color="#222" />
            {Array.from({ length: 52 }).map((_, j) => (
              <mesh key={j} position={[(j - 26) * 2.1, 0.3, 0]} castShadow>
                <boxGeometry args={[0.45, 0.45, 0.65]} />
                <meshStandardMaterial color={getRowColor(i)} roughness={0.4} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
      <group position={[0, 18, -3]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[114, 0.6, 26]} />
          <meshStandardMaterial color="#1a1a1a" side={DoubleSide} />
        </mesh>
        <group position={[0, -0.4, 12]}>
          {[-0.3, -0.1, 0.1, 0.3].map((off) => (
            <group key={off} position={[114 * off, 0, 0]}>
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[3, 1.5, 1.5]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, -0.6, 0.6]} rotation={[Math.PI / 4, 0, 0]}>
                <planeGeometry args={[2.5, 1.2]} />
                <meshBasicMaterial color="#fff" />
              </mesh>
            </group>
          ))}
          <pointLight intensity={150} distance={150} color="#fffcf0" position={[0, -10, 0]} />
        </group>
        {[-52, -26, 0, 26, 52].map((x) => (
          <mesh key={x} position={[x, -9, -10]}>
            <cylinderGeometry args={[0.2, 0.2, 18]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SouthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={[0, 0, 46]}>
      <mesh position={[0, 4.5, 10]} castShadow receiveShadow>
        <boxGeometry args={[100, 9, 2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 0, -5]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 + 0.25, i * 0.8]} castShadow receiveShadow>
            <boxGeometry args={[98, 0.5, 1]} />
            <meshStandardMaterial color="#282828" />
            {Array.from({ length: 46 }).map((_, j) => (
              <mesh key={j} position={[(j - 23) * 2.1, 0.3, 0]} castShadow>
                <boxGeometry args={[0.45, 0.45, 0.65]} />
                <meshStandardMaterial color={getRowColor(i)} roughness={0.4} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
      <group position={[0, 9, 3]}>
        <mesh rotation={[0, 0, 0]} castShadow>
          <boxGeometry args={[102, 0.4, 14]} />
          <meshStandardMaterial color="#2a2a2a" side={DoubleSide} />
        </mesh>
        <group position={[0, -0.3, 6]}>
          {[-0.2, 0, 0.2].map((off) => (
            <group key={off} position={[100 * off, 0, 0]}>
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[2, 1, 1]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, -0.4, 0.4]} rotation={[Math.PI / 4, 0, 0]}>
                <planeGeometry args={[1.8, 0.8]} />
                <meshBasicMaterial color="#fff" />
              </mesh>
            </group>
          ))}
          <pointLight intensity={100} distance={100} color="#fffcf0" position={[0, -5, 0]} />
        </group>
      </group>
    </group>
  );
}

function EastStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={[62, 0, 0]}>
      <mesh position={[4, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 1, 54]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 0, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[i * 0.8, i * 0.5 + 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 0.5, 52]} />
            <meshStandardMaterial color="#2d2d2d" />
            {Array.from({ length: 24 }).map((__, j) => (
              <mesh key={j} position={[0, 0.3, (j - 12) * 2]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.6]} />
                <meshStandardMaterial color={getRowColor(i)} roughness={0.5} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
      <mesh position={[6, 2, 0]} castShadow>
        <boxGeometry args={[0.5, 4, 52]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
      <mesh position={[3, 1, 26]} castShadow>
        <boxGeometry args={[6, 2, 0.5]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
      <mesh position={[3, 1, -26]} castShadow>
        <boxGeometry args={[6, 2, 0.5]} />
        <meshStandardMaterial color="#202020" />
      </mesh>
    </group>
  );
}
