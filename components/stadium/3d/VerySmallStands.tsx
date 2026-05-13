export function VerySmallStands({ seatColor = '#2e7d32' }: { seatColor?: string | string[] }) {
  return (
    <group>
      <MiniNorthStand seatColor={seatColor} />
      <MiniSouthStand seatColor={seatColor} />
    </group>
  );
}

function MiniNorthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={[0, 0, -42]}>
      <mesh position={[0, 1.5, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[80, 3, 1]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      <group position={[0, 0, 0]}>
        {Array.from({ length: 4 }).map((_, i) => (
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
    </group>
  );
}

function MiniSouthStand({ seatColor }: { seatColor: string | string[] }) {
  const getRowColor = (row: number): string => Array.isArray(seatColor) ? seatColor[row % seatColor.length] : seatColor;
  return (
    <group position={[0, 0, 42]}>
      <mesh position={[0, 1.5, 3.5]} castShadow receiveShadow>
        <boxGeometry args={[80, 3, 1]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      <group position={[0, 0, 0]}>
        {Array.from({ length: 4 }).map((_, i) => (
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
