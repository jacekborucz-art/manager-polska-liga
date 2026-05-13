export function Lighting({ stadiumType }: { stadiumType: string }) {
  const showTowers = stadiumType === 'small' || stadiumType === 'very-small' || stadiumType === 'small-regional';

  return (
    <group>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {showTowers && (
        <>
          <Floodlight position={[-60, 0, -40]} rotation={[0, Math.PI / 4, 0]} />
          <Floodlight position={[-60, 0, 40]} rotation={[0, Math.PI * 0.75, 0]} />
          <Floodlight position={[55, 0, -35]} rotation={[0, -Math.PI / 4, 0]} />
          <Floodlight position={[55, 0, 35]} rotation={[0, -Math.PI * 0.75, 0]} />
        </>
      )}
    </group>
  );
}

function Floodlight({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 20, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 40]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <group position={[0, 40, 0]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[5, 4, 1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <pointLight position={[0, 0, 1]} intensity={2000} distance={150} color="#fffcf0" />
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[(i % 3 - 1) * 1.5, (Math.floor(i / 3) - 0.5) * 1.5, 0.6]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
