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
  rowsStart: number;
  rowsEnd: number;
  seatColor: string | string[];
}

export function MediumStands({ seatColor = '#1a3a6a' }: { seatColor?: string | string[] }) {
  return (
    <group>
      <StraightStand position={[0, 0, -48]}  rotation={[0, 0, 0]}          width={100} rows={24} seatColor={seatColor} />
      <StraightStand position={[0, 0, 48]}   rotation={[0, Math.PI, 0]}    width={100} rows={24} seatColor={seatColor} />
      <StraightStand position={[62, 0, 0]}   rotation={[0, -Math.PI / 2, 0]} width={72} rows={14} seatColor={seatColor} />
      <StraightStand position={[-62, 0, 0]}  rotation={[0, Math.PI / 2, 0]}  width={72} rows={14} seatColor={seatColor} />
      <BowlCorner center={[50, 0, -36]}  startAngle={-Math.PI / 2}    endAngle={0}             rowsStart={24} rowsEnd={14} seatColor={seatColor} />
      <BowlCorner center={[-50, 0, -36]} startAngle={Math.PI}         endAngle={Math.PI * 1.5} rowsStart={14} rowsEnd={24} seatColor={seatColor} />
      <BowlCorner center={[50, 0, 36]}   startAngle={0}               endAngle={Math.PI / 2}   rowsStart={14} rowsEnd={24} seatColor={seatColor} />
      <BowlCorner center={[-50, 0, 36]}  startAngle={Math.PI / 2}     endAngle={Math.PI}       rowsStart={24} rowsEnd={14} seatColor={seatColor} />
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
          {[-0.4, -0.2, 0, 0.2, 0.4].map((offset) => (
            <group key={offset} position={[width * offset, 0, 0]}>
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
          <mesh>
            <boxGeometry args={[width * 0.9, 0.1, 0.2]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
          <pointLight intensity={100} distance={100} color="#fffcf0" position={[0, -5, 0]} />
        </group>
      </group>
    </group>
  );
}

function BowlCorner({ center, startAngle, endAngle, rowsStart, rowsEnd, seatColor }: CornerProps) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  const segments = 12;
  const angularStep = (endAngle - startAngle) / segments;
  const radius = 12;
  return (
    <group position={center}>
      {Array.from({ length: segments }).map((_, s) => {
        const offset = (s + 0.5) * angularStep;
        const angle = startAngle + offset;
        const progress = s / segments;
        const avgRows = rowsStart + (rowsEnd - rowsStart) * progress;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const arcLength = Math.abs(angularStep) * radius;
        const width = arcLength + 1.5;
        return (
          <group key={s} position={[x, 0, z]} rotation={[0, -angle - Math.PI / 2, 0]}>
            <mesh position={[0, (avgRows * 0.5 + 5) / 2, -(avgRows * 0.8 + 0.5)]} castShadow receiveShadow>
              <boxGeometry args={[width, avgRows * 0.5 + 5, 1.2]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <group>
              {Array.from({ length: Math.floor(avgRows) }).map((__, i) => (
                <mesh key={i} position={[0, i * 0.5 + 0.25, -i * 0.8]} castShadow receiveShadow>
                  <boxGeometry args={[width, 0.51, 0.81]} />
                  <meshStandardMaterial color="#222" />
                  <mesh position={[0, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.45, 0.45, 0.65]} />
                    <meshStandardMaterial color={getRowColor(i)} />
                  </mesh>
                </mesh>
              ))}
            </group>
            <group position={[0, avgRows * 0.5 + 4, -(avgRows * 0.4)]}>
              <mesh castShadow>
                <boxGeometry args={[width, 0.4, avgRows * 0.8 + 4]} />
                <meshStandardMaterial color="#1a1a1a" side={DoubleSide} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
