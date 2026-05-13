import { DoubleSide } from 'three';

interface StraightProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  rows: number;
  seatColor: string | string[];
}

interface CornerProps {
  center: [number, number, number];
  startAngle: number;
  endAngle: number;
  rows: number;
  seatColor: string | string[];
}

export function ColossalStands({ seatColor = '#1a3a6a' }: { seatColor?: string | string[] }) {
  const rows = 48;
  return (
    <group>
      <StraightStand position={[0, 0, -56]}  rotation={[0, 0, 0]}            width={120} rows={rows} seatColor={seatColor} />
      <StraightStand position={[0, 0, 56]}   rotation={[0, Math.PI, 0]}      width={120} rows={rows} seatColor={seatColor} />
      <StraightStand position={[72, 0, 0]}   rotation={[0, -Math.PI / 2, 0]} width={88}  rows={rows} seatColor={seatColor} />
      <StraightStand position={[-72, 0, 0]}  rotation={[0, Math.PI / 2, 0]}  width={88}  rows={rows} seatColor={seatColor} />
      <BowlCorner center={[60, 0, -44]}  startAngle={-Math.PI / 2}    endAngle={0}             rows={rows} seatColor={seatColor} />
      <BowlCorner center={[-60, 0, -44]} startAngle={Math.PI}         endAngle={Math.PI * 1.5} rows={rows} seatColor={seatColor} />
      <BowlCorner center={[60, 0, 44]}   startAngle={0}               endAngle={Math.PI / 2}   rows={rows} seatColor={seatColor} />
      <BowlCorner center={[-60, 0, 44]}  startAngle={Math.PI / 2}     endAngle={Math.PI}       rows={rows} seatColor={seatColor} />
    </group>
  );
}

function StraightStand({ position, rotation, width, rows, seatColor }: StraightProps) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, (rows * 0.5 + 6) / 2, -(rows * 0.8 + 0.5)]} castShadow receiveShadow>
        <boxGeometry args={[width, rows * 0.5 + 6, 1]} />
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
      <group position={[0, rows * 0.5 + 5, -(rows * 0.4)]}>
        <mesh castShadow>
          <boxGeometry args={[width, 0.4, rows * 0.8 + 8]} />
          <meshStandardMaterial color="#1a1a1a" side={DoubleSide} />
        </mesh>
        <group position={[0, -0.3, rows * 0.4 + 2]}>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((offset) => (
            <group key={offset} position={[width * offset, 0, 0]}>
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <boxGeometry args={[2.5, 1.2, 1.2]} />
                <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, -0.5, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
                <planeGeometry args={[2.2, 1]} />
                <meshBasicMaterial color="#fff" />
              </mesh>
            </group>
          ))}
          <mesh>
            <boxGeometry args={[width * 0.9, 0.1, 0.2]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <pointLight intensity={150} distance={150} color="#fffcf0" position={[0, -8, 0]} />
        </group>
      </group>
    </group>
  );
}

function BowlCorner({ center, startAngle, endAngle, rows, seatColor }: CornerProps) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  const segments = 14;
  const angularStep = (endAngle - startAngle) / segments;
  const radius = 12;
  return (
    <group position={center}>
      {Array.from({ length: segments }).map((_, s) => {
        const offset = (s + 0.5) * angularStep;
        const angle = startAngle + offset;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const arcLength = Math.abs(angularStep) * radius;
        const width = arcLength + 2;
        return (
          <group key={s} position={[x, 0, z]} rotation={[0, -angle - Math.PI / 2, 0]}>
            <mesh position={[0, (rows * 0.5 + 6) / 2, -(rows * 0.8 + 0.5)]} castShadow receiveShadow>
              <boxGeometry args={[width, rows * 0.5 + 6, 1.2]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <group>
              {Array.from({ length: rows }).map((__, i) => (
                <mesh key={i} position={[0, i * 0.5 + 0.25, -i * 0.8]} castShadow receiveShadow>
                  <boxGeometry args={[width, 0.51, 0.81]} />
                  <meshStandardMaterial color="#222" />
                  {Array.from({ length: Math.max(1, Math.floor(width / 2.2)) }).map((_, j) => (
                    <mesh key={j} position={[(j - Math.floor(width / 4.4)) * 2.2, 0.3, 0]} castShadow>
                      <boxGeometry args={[0.45, 0.45, 0.65]} />
                      <meshStandardMaterial color={getRowColor(i)} />
                    </mesh>
                  ))}
                </mesh>
              ))}
            </group>
            <group position={[0, rows * 0.5 + 5, -(rows * 0.4)]}>
              <mesh castShadow>
                <boxGeometry args={[width, 0.4, rows * 0.8 + 8]} />
                <meshStandardMaterial color="#1a1a1a" side={DoubleSide} />
              </mesh>
              <group position={[0, -0.3, rows * 0.4 + 2]}>
                <mesh>
                  <boxGeometry args={[width * 0.8, 0.05, 0.1]} />
                  <meshBasicMaterial color="#fff" />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}
