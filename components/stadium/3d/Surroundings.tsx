export function Surroundings() {
  return (
    <group>
      <group position={[0, 0, 45]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[(i - 10) * 5, 1, 0]}>
            <boxGeometry args={[0.1, 2, 0.1]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[100, 0.05, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0.01, 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[120, 10]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      </group>

      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#1a2e1a" />
      </mesh>
    </group>
  );
}
