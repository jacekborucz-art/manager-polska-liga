import { Vector3 } from 'three';

export function Pitch() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[105 * 1.2, 68 * 1.2]} />
        <meshStandardMaterial color="#1a351a" roughness={0.8} />
      </mesh>

      <group position={[0, 0.05, 0]}>
        <lineLoop>
          <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([
            new Vector3(-52.5, 0, -34),
            new Vector3(52.5, 0, -34),
            new Vector3(52.5, 0, 34),
            new Vector3(-52.5, 0, 34),
          ])} />
          <lineBasicMaterial attach="material" color="white" linewidth={2} />
        </lineLoop>

        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 68]} />
          <meshBasicMaterial color="white" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[9.1, 9.2, 64]} />
          <meshBasicMaterial color="white" />
        </mesh>

        <PenaltyArea side={1} />
        <PenaltyArea side={-1} />
      </group>

      <Goal side={1} />
      <Goal side={-1} />
    </group>
  );
}

function Goal({ side }: { side: number }) {
  const x = side * 52.5;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.22, -3.66]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.44]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1.22, 3.66]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.44]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 2.44, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 7.32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[side * 1, 1.22, 0]} castShadow>
        <boxGeometry args={[2, 2.44, 7.32]} />
        <meshStandardMaterial color="white" transparent opacity={0.15} wireframe />
      </mesh>
    </group>
  );
}

function PenaltyArea({ side }: { side: number }) {
  const x = side * 52.5;
  return (
    <group position={[x, 0, 0]}>
      <lineLoop>
        <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([
          new Vector3(0, 0, -20.15),
          new Vector3(-side * 16.5, 0, -20.15),
          new Vector3(-side * 16.5, 0, 20.15),
          new Vector3(0, 0, 20.15),
        ])} />
        <lineBasicMaterial attach="material" color="white" />
      </lineLoop>
      <lineLoop>
        <bufferGeometry attach="geometry" onUpdate={(self) => self.setFromPoints([
          new Vector3(0, 0, -9.16),
          new Vector3(-side * 5.5, 0, -9.16),
          new Vector3(-side * 5.5, 0, 9.16),
          new Vector3(0, 0, 9.16),
        ])} />
        <lineBasicMaterial attach="material" color="white" />
      </lineLoop>
      <mesh position={[-side * 11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}
