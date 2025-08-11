// TypeScript: declare global window properties for 3D drag-drop
declare global {
  interface Window {
    _threeCamera?: THREE.PerspectiveCamera;
    _threeScene?: THREE.Scene;
  }
}
import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
// 3D Jacket with multiple badges/icons
function Jacket3D({ color, badges }: { color: string, badges: { icon: string, position: [number, number, number] }[] }) {
  // Map color names to hex codes
  const colorMap: Record<string, string> = {
    Black: '#222',
    Brown: '#7c4a03',
    Tan: '#d2b48c',
    Burgundy: '#800020',
    Custom: '#888',
  };
  // Jacket proportions
  const bodyHeight = 1.5;
  const bodyTop = 0.5;
  const bodyBottom = 0.7;
  const sleeveLength = 1.1;
  const sleeveRadius = 0.16;
  const shoulderY = 0.7 + bodyHeight / 2 - 0.1;
  return (
    <group>
      {/* Torso/body */}
      <mesh castShadow receiveShadow position={[0, shoulderY - bodyHeight / 2, 0]} name="JACKET_BODY">
        <cylinderGeometry args={[bodyTop, bodyBottom, bodyHeight, 32]} />
        <meshStandardMaterial color={colorMap[color] || '#888'} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Left sleeve */}
      <mesh position={[-0.62, shoulderY + 0.1, 0]} rotation={[0, 0, Math.PI / 2.7]}>
        <cylinderGeometry args={[sleeveRadius, sleeveRadius * 0.9, sleeveLength, 24]} />
        <meshStandardMaterial color={colorMap[color] || '#888'} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Right sleeve */}
      <mesh position={[0.62, shoulderY + 0.1, 0]} rotation={[0, 0, -Math.PI / 2.7]}>
        <cylinderGeometry args={[sleeveRadius, sleeveRadius * 0.9, sleeveLength, 24]} />
        <meshStandardMaterial color={colorMap[color] || '#888'} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, shoulderY + bodyHeight / 2 + 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.07, 16, 100, Math.PI]} />
        <meshStandardMaterial color={'#444'} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Front zipper/seam */}
      <mesh position={[0, shoulderY - bodyHeight / 2 + bodyHeight / 2, 0.13]}>
        <boxGeometry args={[0.04, bodyHeight * 0.95, 0.03]} />
        <meshStandardMaterial color={'#bbb'} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Badge (if placed) */}
      {badges && badges.map((badge, index) => (
        <mesh key={index} position={badge.position} castShadow>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
// List of draggable icons
const ICONS = [
  { name: 'Star', icon: '★', color: '#eab308' },
  { name: 'Heart', icon: '❤', color: '#ef4444' },
  { name: 'Bolt', icon: '⚡', color: '#f59e42' },
  { name: 'Peace', icon: '☮', color: '#38bdf8' },
  { name: 'Smile', icon: '😊', color: '#fbbf24' },
];

// List of draggable Nordic/traditional badges (using emoji as placeholders)
const NORDIC_BADGES = [
  { name: 'Reindeer', icon: '🦌', color: '#a3a3a3' },
  { name: 'Deer', icon: '🦌', color: '#7c4a03' },
  { name: 'Ox', icon: '🐂', color: '#b91c1c' },
  { name: 'Rabbit', icon: '🐇', color: '#f9fafb' },
  { name: 'Vikings', icon: '🪓', color: '#64748b' },
  { name: 'Axe', icon: '🪓', color: '#d1d5db' },
  { name: 'Harley Davidson', icon: '🏍️', color: '#f59e42' },
  { name: 'Chopper Bike', icon: '🏍️', color: '#222' },
];

// Draggable icon component
function DraggableIcon({ icon, color, dragging, setDragging, setDragIcon }: { icon: string, color: string, dragging: boolean, setDragging: (v: boolean) => void, setDragIcon: (icon: string) => void }) {
  return (
    <div
      style={{
        width: 48, height: 48, borderRadius: 24, background: color, boxShadow: '0 2px 8px #0002', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', opacity: dragging ? 0.5 : 1,
      }}
      draggable
      onDragStart={() => { setDragging(true); setDragIcon(icon); }}
      onDragEnd={() => setDragging(false)}
      title={icon}
    >
      <span style={{ fontWeight: 700, fontSize: 24, color: '#fff' }}>{icon}</span>
    </div>
  );
}

// Example options, can be expanded
const COLORS = [
  { name: "Black", hex: "#222" },
  { name: "Brown", hex: "#7c4a03" },
  { name: "Tan", hex: "#d2b48c" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Custom", hex: "#888" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MATERIALS = ["Lambskin", "Cowhide", "Goatskin"];
const LININGS = ["Satin", "Cotton", "Silk"];

export default function CustomJacketConfigurator() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    color: COLORS[0].name,
    size: SIZES[2],
    material: MATERIALS[0],
    lining: LININGS[0],
    monogram: "",
    notes: ""
  });
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Drag-and-drop icon state
  const [dragging, setDragging] = useState(false);
  const [dragIcon, setDragIcon] = useState<string | null>(null);
  const [badges, setBadges] = useState<{ icon: string, position: [number, number, number] }[]>([]);
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleColorSelect(name: string) {
    setForm({ ...form, color: name });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await axios.post("/api/custom-jacket-orders", form);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Submission failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-0 md:p-4 relative">
      {/* Draggable icon lists overlay - now above 3D preview, row layout, responsive */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 16,
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16,
          boxShadow: '0 2px 12px #0001',
          padding: '10px 24px',
          alignItems: 'flex-start',
          maxWidth: '90vw',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginRight: 8, minWidth: 70 }}>Popular</div>
          {ICONS.map(ic => (
            <DraggableIcon
              key={ic.name}
              icon={ic.icon}
              color={ic.color}
              dragging={dragging && dragIcon === ic.icon}
              setDragging={setDragging}
              setDragIcon={setDragIcon}
            />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginRight: 8, minWidth: 110 }}>Nordic Badges</div>
          {NORDIC_BADGES.map(b => (
            <DraggableIcon
              key={b.name}
              icon={b.icon}
              color={b.color}
              dragging={dragging && dragIcon === b.icon}
              setDragging={setDragging}
              setDragIcon={setDragIcon}
            />
          ))}
        </div>
      </div>
      <div className="w-full max-w-7xl bg-white rounded-lg shadow flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Sidebar Stepper */}
        <aside className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-6 sticky top-0 z-10">
          <h2 className="text-xl font-bold mb-2">{t('customJacket.title')}</h2>
          <nav className="flex flex-col gap-4">
            {/* Step 1: Color */}
            <div>
              <div className="font-semibold mb-1">1. {t('customJacket.color')}</div>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${form.color === c.name ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-slate-300'} flex items-center justify-center transition-all`}
                    style={{ background: c.hex }}
                    aria-label={c.name}
                    onClick={() => handleColorSelect(c.name)}
                  >
                    {form.color === c.name && <span className="text-xs text-yellow-900 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            {/* Step 2: Size */}
            <div>
              <div className="font-semibold mb-1">2. {t('customJacket.size')}</div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`px-3 py-1 rounded border ${form.size === s ? 'bg-yellow-400 border-yellow-500 text-leather-900 font-bold' : 'bg-white border-slate-300 text-slate-700'} transition-all`}
                    onClick={() => setForm({ ...form, size: s })}
                  >{s}</button>
                ))}
              </div>
            </div>
            {/* Step 3: Material */}
            <div>
              <div className="font-semibold mb-1">3. {t('customJacket.material')}</div>
              <div className="flex gap-2 flex-wrap">
                {MATERIALS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`px-3 py-1 rounded border ${form.material === m ? 'bg-yellow-400 border-yellow-500 text-leather-900 font-bold' : 'bg-white border-slate-300 text-slate-700'} transition-all`}
                    onClick={() => setForm({ ...form, material: m })}
                  >{m}</button>
                ))}
              </div>
            </div>
            {/* Step 4: Lining */}
            <div>
              <div className="font-semibold mb-1">4. {t('customJacket.lining')}</div>
              <div className="flex gap-2 flex-wrap">
                {LININGS.map(l => (
                  <button
                    key={l}
                    type="button"
                    className={`px-3 py-1 rounded border ${form.lining === l ? 'bg-yellow-400 border-yellow-500 text-leather-900 font-bold' : 'bg-white border-slate-300 text-slate-700'} transition-all`}
                    onClick={() => setForm({ ...form, lining: l })}
                  >{l}</button>
                ))}
              </div>
            </div>
            {/* Step 5: Monogram */}
            <div>
              <div className="font-semibold mb-1">5. {t('customJacket.monogram')}</div>
              <input name="monogram" value={form.monogram} onChange={handleChange} className="w-full border rounded p-2" maxLength={10} placeholder="e.g. O.F.K." />
            </div>
            {/* Step 6: Notes */}
            <div>
              <div className="font-semibold mb-1">6. {t('customJacket.notes')}</div>
              <input name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded p-2" placeholder="Anything else?" />
            </div>
          </nav>
        </aside>
        {/* 3D Preview + Sticky Submit */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-8">
          <div
            className="aspect-square w-full max-w-2xl h-auto bg-slate-100 rounded-lg border border-slate-200 shadow-inner mx-auto relative"
            onDragOver={e => { if (dragging) e.preventDefault(); }}
            onDrop={e => {
              if (!dragging) return;
              const rect = (e.target as HTMLDivElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
              const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
              const camera = window._threeCamera;
              const scene = window._threeScene;
              if (!camera || !scene) return;
              const mouse = new THREE.Vector2(x, y);
              const raycaster = new THREE.Raycaster();
              raycaster.setFromCamera(mouse, camera);
              const jacketMesh = scene.getObjectByName('JACKET_BODY');
              if (jacketMesh) {
                const intersects = raycaster.intersectObject(jacketMesh);
                if (intersects.length > 0) {
                  const p = intersects[0].point;
                  // setBadgePosition([p.x, p.y, p.z]); // (old, now unused)
                }
              }
              setDragging(false);
            }}
          >
            <Canvas shadows camera={{ position: [0, 2, 4], fov: 40 }}
              onCreated={({ camera, scene }) => {
                window._threeCamera = camera as THREE.PerspectiveCamera;
                window._threeScene = scene;
              }}
            >
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
              <Stage environment={null} intensity={0.6} castShadow>
                <Jacket3D color={form.color} badges={badges} />
              </Stage>
              <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2} />
            </Canvas>
          </div>
          {/* Sticky Submit and Summary */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-6 sticky bottom-0 bg-white/80 backdrop-blur border-t border-slate-200 p-4 rounded-b-lg flex flex-col gap-2 shadow-lg z-20">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="text-sm text-slate-700 font-medium">
                <span className="mr-2">{t('customJacket.color')}: <span className="font-bold">{form.color}</span></span>
                <span className="mr-2">{t('customJacket.size')}: <span className="font-bold">{form.size}</span></span>
                <span className="mr-2">{t('customJacket.material')}: <span className="font-bold">{form.material}</span></span>
                <span className="mr-2">{t('customJacket.lining')}: <span className="font-bold">{form.lining}</span></span>
                {form.monogram && <span className="mr-2">{t('customJacket.monogram')}: <span className="font-bold">{form.monogram}</span></span>}
              </div>
              <Button type="submit" className="px-8 py-2 text-lg font-bold bg-yellow-400 hover:bg-yellow-500 text-leather-900 rounded shadow transition-all">
                {t('customJacket.submit') || "Submit Custom Order"}
              </Button>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {badges.length > 0 && (
              <div className="mt-2 text-xs text-yellow-700">
                Badges placed: {badges.map((b, i) => `${b.icon} (${b.position.map(n => n.toFixed(2)).join(", ")})`).join('; ')}
              </div>
            )}
            {submitted && <div className="mt-4 text-green-600 font-semibold text-center">{t('customJacket.thankYou') || "Thank you for your custom order! We will contact you soon."}</div>}
          </form>
        </main>
      </div>
    </div>
  );
}
