import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Float } from "@react-three/drei";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import * as THREE from "three";
import AnimatedSection from "./AnimatedSection";
import { Code2, Cpu, Database, Cloud, Layers, Terminal } from "lucide-react";

interface TechLabelProps {
  text: string;
  position: [number, number, number];
  index: number;
  total: number;
}

const TechLabel = ({ text, position, index, total }: TechLabelProps) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.3 + (index / total) * Math.PI * 2;
    const r = 2.2;
    ref.current.position.x = position[0] + Math.sin(t) * r * 0.3;
    ref.current.position.y = position[1] + Math.cos(t * 0.7) * r * 0.2;
    ref.current.position.z = position[2] + Math.sin(t * 0.5) * r * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        <Text
          fontSize={0.25}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

const SphereWireframe = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x += 0.001;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.2, 32, 32]} />
      <meshBasicMaterial color="#3b82f6" wireframe opacity={0.08} transparent />
    </mesh>
  );
};

const RobotAvatar = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.15;
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.6;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Head */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Glowing Eyes */}
      <mesh position={[-0.3, 0.2, 0.61]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.3, 0.2, 0.61]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Internal Glow Light */}
      <pointLight color="#3b82f6" intensity={2} distance={3} position={[0, 0, 0.7]} />
      
      {/* Side Antennas */}
      <mesh position={[-0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Top Antenna */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshBasicMaterial color="#60a5fa" />
      </mesh>
    </group>
  );
};

const Scene = () => {
  const techStack = useCMSData(d => d.techStack) || initialData.techStack;
  const tools = techStack?.featured || initialData.techStack.featured;

  const positions = useMemo(() => {
    const count = tools.length;
    return tools.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2.4;
      return [
        r * Math.cos(theta) * Math.sin(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(phi),
      ] as [number, number, number];
    });
  }, [tools]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      
      <SphereWireframe />
      
      {/* 3D Movable Avatar */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
        <RobotAvatar />
      </Float>

      {tools.map((tech, i) => (
        <TechLabel key={tech} text={tech} position={positions[i]} index={i} total={tools.length} />
      ))}
    </>
  );
};

const getTechIcon = (tech: string) => {
  const lower = tech.toLowerCase();
  if (lower.includes('python') || lower.includes('spark') || lower.includes('pandas') || lower.includes('sql') || lower.includes('mongo') || lower.includes('redis')) return <Database className="w-5 h-5" />;
  if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('aws') || lower.includes('gcp') || lower.includes('linux')) return <Cloud className="w-5 h-5" />;
  if (lower.includes('tensorflow') || lower.includes('pytorch') || lower.includes('opencv') || lower.includes('scikit') || lower.includes('keras')) return <Cpu className="w-5 h-5" />;
  if (lower.includes('langchain') || lower.includes('huggingface') || lower.includes('openai') || lower.includes('airflow') || lower.includes('mlflow')) return <Layers className="w-5 h-5" />;
  if (lower.includes('git') || lower.includes('bash')) return <Terminal className="w-5 h-5" />;
  return <Code2 className="w-5 h-5" />;
};

const TechSphere = () => {
  const techStack = useCMSData(d => d.techStack) || initialData.techStack;
  const allTools = techStack?.all || initialData.techStack.all;
  
  const isDense = allTools.length > 12;
  const gridClass = isDense 
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" 
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  
  const cardPadding = isDense ? "p-3 sm:p-4" : "p-5 sm:p-6";
  const iconSize = isDense ? "w-8 h-8" : "w-10 h-10";
  const textSize = isDense ? "text-sm sm:text-base" : "text-base sm:text-lg";

  return (
    <section className="section-padding relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2 text-center">Tech Stack</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            My <span className="gradient-text">Technology Ecosystem</span>
          </h3>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            Technologies I work with to build intelligent systems
          </p>
        </AnimatedSection>

        {/* Adjusted Canvas Height and Spacing here */}
        <AnimatedSection>
          <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] max-w-[280px] sm:max-w-md md:max-w-lg mx-auto mb-10 md:mb-16">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full z-0 pointer-events-none" />
            <div className="relative z-10 w-full h-full">
              <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
                <Suspense fallback={null}>
                  <Scene />
                </Suspense>
              </Canvas>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <h4 className="text-2xl font-heading font-semibold text-foreground border-l-4 border-primary pl-4">
                Full Technology Arsenal
              </h4>
              <div className="text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                {allTools.length} Tools & Technologies
              </div>
            </div>
            
            <div className={`grid gap-3 sm:gap-4 md:gap-5 ${gridClass} overflow-x-auto pb-4 custom-scrollbar`}>
              {allTools.map((tech, index) => (
                <div 
                  key={tech}
                  className="group relative flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-[1.03] transition-all duration-300"
                  style={{ transitionDelay: `${(index % 12) * 20}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className={`${cardPadding} w-full flex flex-col items-center gap-3 relative z-10`}>
                    <div className={`flex items-center justify-center rounded-lg bg-background/50 border border-white/5 ${iconSize} text-primary group-hover:text-white group-hover:bg-primary/80 transition-colors duration-300 shadow-inner`}>
                      {getTechIcon(tech)}
                    </div>
                    <span className={`font-medium text-center text-foreground/90 group-hover:text-white transition-colors ${textSize} line-clamp-1`}>
                      {tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TechSphere;
