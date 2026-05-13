import { DoubleSide } from 'three';

interface StraightProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  rows: number;
  seatColor: string | string[];
}

export function LargeStands({ seatColor = '#1a3a6a' }: { seatColor?: string | string[] }) {
  return (
    <group>
      <StraightStand position={[0, 0, -48]}  rotation={[0, 0, 0]}          width={110} rows={16} seatColor={seatColor} />
      <StraightStand position={[0, 0, 48]}   rotation={[0, Math.PI, 0]}    width={110} rows={16} seatColor={seatColor} />
      <StraightStand position={[62, 0, 0]}   rotation={[0, -Math.PI / 2, 0]} width={72} rows={12} seatColor={seatColor} />
      <StraightStand position={[-62, 0, 0]}  rotation={[0, Math.PI / 2, 0]}  width={72} rows={12} seatColor={seatColor} />
    </group>
  );
}

function StraightStand({ position, rotation, width, rows, seatColor }: StraightProps) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, (rows * 0.5 + 5) / 2, -(rows * 0.8 + 0.5)]} castShadow receiveShadow>
        <boxGeometry args={[width, rows * 0.5 + 5, 1]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <group>
        {Array.from({ length: rows }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.5 + 0.25, -i * 0.8]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.51, 0.81]} />
            <meshStandardMaterial color="#222" />
            {Array.from({ length: Math.floor(width / 2.2) }).map((_, j) => (
              <mesh key={j} position={[(j - Math.floor(width / 4.4)) * 2.2, 0.3, 0]} castShadow>
                <boxGeometry args={[0.45, 0.45, 0.65]} />
                <meshStandardMaterial color={getRowColor(i)} roughness={0.5} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
      <group position={[0, rows * 0.5 + 4, -(rows * 0.4)]}>
        <mesh castShadow>
          <boxGeometry args={[width, 0.4, rows * 0.8 + 4]} />
          <meshStandardMaterial color="#1a1a1a" side={DoubleSide} />
        </mesh>
        <group position={[0, -0.3, rows * 0.4]}>
          {[-0.35, -0.15, 0.15, 0.35].map((offset) => (
            <group key={offset} position={[width * offset, 0, 0]}>
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[1.5, 0.8, 0.8]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, -0.3, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
                <planeGeometry args={[1.3, 0.6]} />
                <meshBasicMaterial color="#fff" />
              </mesh>
            </group>
          ))}
          <mesh>
            <boxGeometry args={[width * 0.9, 0.1, 0.1]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <pointLight intensity={80} distance={80} color="#fffcf0" position={[0, -4, 0]} />
        </group>
      </group>
    </group>
  );
}
