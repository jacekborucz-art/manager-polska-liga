import { DoubleSide } from 'three';

export function SmallRegionalStands({ seatColor = '#cc0000' }: { seatColor?: string | string[] }) {
  return (
    <group>
      <RegionalNorthStand seatColor={seatColor} />
      <RegionalSouthStand seatColor={seatColor} />
      <RegionalEastWestStand position={[55, 0, 0]} rotation={[0, -Math.PI / 2, 0]} seatColor={seatColor} />
      <RegionalEastWestStand position={[-55, 0, 0]} rotation={[0, Math.PI / 2, 0]} seatColor={seatColor} />
      <RegionalFloodlight position={[65, 0, -45]} rotation={[0, -Math.PI / 4, 0]} />
      <RegionalFloodlight position={[-65, 0, -45]} rotation={[0, Math.PI / 4, 0]} />
      <RegionalFloodlight position={[65, 0, 45]} rotation={[0, -Math.PI * 0.75, 0]} />
      <RegionalFloodlight position={[-65, 0, 45]} rotation={[0, Math.PI * 0.75, 0]} />
    </group>
  );
}

function RegionalFloodlight({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 10, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 20]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 20, 0]}>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 20.5, 0.2]} rotation={[Math.PI / 6, 0, 0]}>
        {[-1.2, 0, 1.2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1, 1.2, 0.4]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0, 0, 0.21]}>
              <planeGeometry args={[0.8, 1]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}
        <pointLight intensity={1200} distance={150} color="#fffcf0" position={[0, -2, 2]} />
      </group>
    </group>
  );
}

function RegionalNorthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  const rows = 6;
  return (
    <group position={[0, 0, -42]}>
      <mesh position={[0, 3, -4.5]} castShadow receiveShadow>
        <boxGeometry args={[80, 6, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 0, 0]}>
        {Array.from({ length: rows }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.4 + 0.2, -i * 0.6]} castShadow receiveShadow>
            <boxGeometry args={[78, 0.4, 0.8]} />
            <meshStandardMaterial color="#222" />
            {Array.from({ length: 30 }).map((_, j) => (
              <mesh key={j} position={[(j - 15) * 2.5, 0.25, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.5]} />
                <meshStandardMaterial color={getRowColor(i)} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
      <group position={[0, 6, -1]}>
        <mesh rotation={[0.1, 0, 0]} castShadow>
          <boxGeometry args={[82, 0.3, 10]} />
          <meshStandardMaterial color="#222" side={DoubleSide} />
        </mesh>
        {[-38, -12, 12, 38].map((x) => (
          <mesh key={x} position={[x, -3, -3]}>
            <cylinderGeometry args={[0.1, 0.1, 6]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RegionalSouthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  const rows = 6;
  return (
    <group position={[0, 0, 42]}>
      <mesh position={[0, 2, 4.5]} castShadow receiveShadow>
        <boxGeometry args={[80, 4, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group position={[0, 0, 0]}>
        {Array.from({ length: rows }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.4 + 0.2, i * 0.6]} castShadow receiveShadow>
            <boxGeometry args={[78, 0.4, 0.8]} />
            <meshStandardMaterial color="#222" />
            {Array.from({ length: 30 }).map((_, j) => (
              <mesh key={j} position={[(j - 15) * 2.5, 0.25, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.5]} />
                <meshStandardMaterial color={getRowColor(i)} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
    </group>
  );
}

function RegionalEastWestStand({ position, rotation, seatColor }: { position: [number, number, number]; rotation: [number, number, number]; seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  const rows = 4;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.5, -3]} castShadow receiveShadow>
        <boxGeometry args={[50, 3, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <group>
        {Array.from({ length: rows }).map((_, i) => (
          <mesh key={i} position={[0, i * 0.4 + 0.2, -i * 0.6]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.4, 0.8]} />
            <meshStandardMaterial color="#222" />
            {Array.from({ length: 18 }).map((_, j) => (
              <mesh key={j} position={[(j - 9) * 2.5, 0.25, 0]} castShadow>
                <boxGeometry args={[0.4, 0.3, 0.5]} />
                <meshStandardMaterial color={getRowColor(i)} />
              </mesh>
            ))}
          </mesh>
        ))}
      </group>
    </group>
  );
}
