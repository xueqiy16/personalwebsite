"use client";

// ===== White-Glow Palette =====
const C = {
  white: "#99CBFF", // base walls
  warmWhite: "#FFD1FA", // two tower walls
  iceWhite: "#FDFFC4",
  lavender: "#FDFFC4",
  platform: "#E0D8F0",
  accent: "#00D1D1", // rooftop
  teal: "#7DFF9A", // two blocks and under the tree
  tealLight: "#00D170", // block in the front
  deep: "#9888C0", // middle/top windows
  dark: "#7868A8", // lower windows
  cream: "#FFFFF8", // middle platform
  pinkAccent: "#FFE0F0",
  gold: "#F0E8C8",
};

// Shared emissive props — gives every lit surface a soft white glow
const G = { emissive: "#ffffff" as const, emissiveIntensity: 0.22 };

// ===== Reusable tower sub-component (pagoda style) =====
function Tower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tower body */}
      <mesh position={[0, 9.05, 0]}>
        <boxGeometry args={[1.4, 4, 1.4]} />
        <meshStandardMaterial color={C.warmWhite} {...G} />
      </mesh>

      {/* Pagoda tier overhangs */}
      {[
        { y: 8.55, w: 1.9 },
        { y: 9.85, w: 1.8 },
        { y: 11.05, w: 1.7 },
      ].map((tier, i) => (
        <group key={`tier-${i}`}>
          <mesh position={[0, tier.y, 0]}>
            <boxGeometry args={[tier.w, 0.12, tier.w]} />
            <meshStandardMaterial color={C.platform} {...G} />
          </mesh>
          <mesh position={[0, tier.y + 0.09, 0]}>
            <boxGeometry args={[tier.w + 0.08, 0.04, tier.w + 0.08]} />
            <meshStandardMaterial color={C.accent} {...G} />
          </mesh>
        </group>
      ))}

      {/* Pointed pagoda cap (square pyramid) */}
      <mesh position={[0, 11.75, 0]}>
        <coneGeometry args={[0.65, 1.2, 4]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* Finial sphere */}
      <mesh position={[0, 12.45, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={C.pinkAccent}
          emissive="#ffffff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Windows on +Z face */}
      {[8.3, 9.4, 10.5].map((y, i) => (
        <mesh key={`wz-${i}`} position={[0, y, 0.72]}>
          <boxGeometry args={[0.35 - i * 0.03, 0.5 - i * 0.04, 0.06]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}

      {/* Windows on +X face */}
      {[8.3, 9.4, 10.5].map((y, i) => (
        <mesh key={`wx-${i}`} position={[0.72, y, 0]}>
          <boxGeometry args={[0.06, 0.5 - i * 0.04, 0.35 - i * 0.03]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Tall, narrow Monument Valley-style tower with a white glow.
 *
 * Structure (bottom to top):
 *   1. Decorative floating base layers
 *   2. Base with arched openings (Door A on +Z, Door B on +X)
 *   3. Middle section with teal accents and decorative circles
 *   4. Open terrace with railings, potted tree, and walkways
 *   5. Two pagoda-style towers with pointed caps
 */
export default function Monument() {
  return (
    <group>
      {/* ===== Inner glow lights ===== */}
      <pointLight position={[0, 4, 0]} intensity={1.2} distance={12} color="#FFFFFF" />
      <pointLight position={[0, 8, 0]} intensity={0.8} distance={10} color="#FFF8F0" />

      {/* ===================================================
          DECORATIVE BOTTOM (floating base)
          =================================================== */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[4.8, 0.12, 4.8]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <boxGeometry args={[4.4, 0.12, 4.4]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <boxGeometry args={[3.8, 0.12, 3.8]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ===================================================
          LAYER 1 — BASE WITH ARCHES  (Y 0 → 4)
          =================================================== */}

      {/* Base floor */}
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[4.5, 0.15, 4.5]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>

      {/* ---- Interior room (dark, visible through arches) ---- */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3.9, 2.8, 3.9]} />
        <meshStandardMaterial color={C.dark} />
      </mesh>

      {/* ---- +Z face wall (Door A: My Beloved Arts) ---- */}
      <mesh position={[-2.05, 2, 2.08]}>
        <boxGeometry args={[0.4, 4, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[0, 2, 2.08]}>
        <boxGeometry args={[0.3, 4, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[2.05, 2, 2.08]}>
        <boxGeometry args={[0.4, 4, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[-1.0, 3.4, 2.08]}>
        <boxGeometry args={[1.7, 1.2, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[1.0, 3.4, 2.08]}>
        <boxGeometry args={[1.7, 1.2, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      {/* Arch accent lines */}
      <mesh position={[-1.0, 2.85, 2.28]}>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[1.0, 2.85, 2.28]}>
        <boxGeometry args={[1.7, 0.08, 0.06]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* ---- +X face wall (Door B: My Projects) ---- */}
      <mesh position={[2.08, 2, -2.05]}>
        <boxGeometry args={[0.35, 4, 0.4]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[2.08, 2, 0]}>
        <boxGeometry args={[0.35, 4, 0.3]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[2.08, 2, 2.05]}>
        <boxGeometry args={[0.35, 4, 0.4]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[2.08, 3.4, -1.0]}>
        <boxGeometry args={[0.35, 1.2, 1.7]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[2.08, 3.4, 1.0]}>
        <boxGeometry args={[0.35, 1.2, 1.7]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      {/* Arch accent lines */}
      <mesh position={[2.28, 2.85, -1.0]}>
        <boxGeometry args={[0.06, 0.08, 1.7]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      <mesh position={[2.28, 2.85, 1.0]}>
        <boxGeometry args={[0.06, 0.08, 1.7]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* ---- Back walls (solid, not directly visible) ---- */}
      <mesh position={[0, 2, -2.08]}>
        <boxGeometry args={[4.5, 4, 0.35]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>
      <mesh position={[-2.08, 2, 0]}>
        <boxGeometry args={[0.35, 4, 4.5]} />
        <meshStandardMaterial color={C.white} {...G} />
      </mesh>

      {/* ---- Interior decorations (seen through arches) ---- */}
      <mesh
        position={[-0.7, 0.45, 1.6]}
        rotation={[0, Math.PI / 4, Math.PI / 4]}
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={C.pinkAccent} emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh
        position={[0.8, 0.35, 1.6]}
        rotation={[0, Math.PI / 6, 0]}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={C.pinkAccent} emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Lantern */}
      <mesh position={[0.5, 2.2, 1.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color="#FFF8E0"
          emissive="#FFF8E0"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Bookshelf near Door B */}
      <mesh position={[1.6, 0.6, -0.6]}>
        <boxGeometry args={[0.15, 1.0, 0.5]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      {/* Small table near Door B */}
      <mesh position={[1.6, 0.25, 0.6]}>
        <boxGeometry args={[0.35, 0.25, 0.35]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ===================================================
          TRANSITION LEDGE (base → middle)
          =================================================== */}
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ===================================================
          LAYER 2 — MIDDLE SECTION  (Y ~4.3 → 6.65)
          =================================================== */}

      {/* Core block */}
      <mesh position={[0, 5.45, 0]}>
        <boxGeometry args={[3.8, 2.3, 3.8]} />
        <meshStandardMaterial color={C.warmWhite} {...G} />
      </mesh>

      {/* Teal accent block on +Z face */}
      <mesh position={[-1.1, 5.2, 2.1]}>
        <boxGeometry args={[1.2, 1.6, 0.6]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>

      {/* Teal accent block on +X face */}
      <mesh position={[2.1, 5.2, -1.1]}>
        <boxGeometry args={[0.6, 1.6, 1.2]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>

      {/* Small teal block on +X face (lower) */}
      <mesh position={[2.0, 4.8, 1.2]}>
        <boxGeometry args={[0.5, 0.8, 0.8]} />
        <meshStandardMaterial color={C.tealLight} {...G} />
      </mesh>

      {/* Decorative circles on +Z face */}
      {[
        { x: 0.8, y: 5.6 },
        { x: 0.8, y: 4.8 },
      ].map((c, i) => (
        <mesh
          key={`cz-${i}`}
          position={[c.x, c.y, 1.92]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}

      {/* Decorative circles on +X face */}
      {[
        { z: 0.8, y: 5.6 },
        { z: 0.8, y: 4.8 },
      ].map((c, i) => (
        <mesh
          key={`cx-${i}`}
          position={[1.92, c.y, c.z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.25, 0.25, 0.06, 12]} />
          <meshStandardMaterial color={C.deep} />
        </mesh>
      ))}

      {/* Windows on middle section */}
      <mesh position={[1.5, 6.0, 1.92]}>
        <boxGeometry args={[0.45, 0.65, 0.06]} />
        <meshStandardMaterial color={C.deep} />
      </mesh>
      <mesh position={[1.92, 6.0, 1.5]}>
        <boxGeometry args={[0.06, 0.65, 0.45]} />
        <meshStandardMaterial color={C.deep} />
      </mesh>

      {/* Walkway extending from +Z face */}
      <mesh position={[0, 5.3, 2.7]}>
        <boxGeometry args={[1.4, 0.12, 1.0]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>
      {/* Walkway railing */}
      <mesh position={[0, 5.6, 3.15]}>
        <boxGeometry args={[1.4, 0.5, 0.06]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* Small walkway on +X face */}
      <mesh position={[2.7, 5.8, 0]}>
        <boxGeometry args={[1.0, 0.12, 1.2]} />
        <meshStandardMaterial color={C.accent} {...G} />
      </mesh>

      {/* ===================================================
          TRANSITION LEDGE (middle → terrace)
          =================================================== */}
      <mesh position={[0, 6.7, 0]}>
        <boxGeometry args={[4.2, 0.12, 4.2]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ===================================================
          LAYER 3 — TERRACE  (Y ~6.85)
          =================================================== */}

      {/* Terrace platform */}
      <mesh position={[0, 6.9, 0]}>
        <boxGeometry args={[5, 0.2, 5]} />
        <meshStandardMaterial color={C.cream} {...G} />
      </mesh>

      {/* Railing posts along +Z edge */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <mesh key={`rz-${i}`} position={[i * 1.0, 7.3, 2.35]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color={C.platform} {...G} />
        </mesh>
      ))}
      {/* Rail bar +Z */}
      <mesh position={[0, 7.45, 2.35]}>
        <boxGeometry args={[4.8, 0.06, 0.06]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* Railing posts along +X edge */}
      {[-2, -1, 0, 1, 2].map((i) => (
        <mesh key={`rx-${i}`} position={[2.35, 7.3, i * 1.0]}>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color={C.platform} {...G} />
        </mesh>
      ))}
      {/* Rail bar +X */}
      <mesh position={[2.35, 7.45, 0]}>
        <boxGeometry args={[0.06, 0.06, 4.8]} />
        <meshStandardMaterial color={C.platform} {...G} />
      </mesh>

      {/* ---- Potted tree ---- */}
      <mesh position={[0, 7.15, 0]}>
        <boxGeometry args={[0.65, 0.3, 0.65]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>
      <mesh position={[0, 7.6, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 6]} />
        <meshStandardMaterial color="#8B7060" />
      </mesh>
      <mesh position={[0, 8.05, 0]}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#90D8A8" emissive="#ffffff" emissiveIntensity={0.1} />
      </mesh>
      {/* Reeds / tall grass */}
      <mesh position={[0.35, 7.55, 0.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 4]} />
        <meshStandardMaterial color="#A0B878" />
      </mesh>
      <mesh position={[0.25, 7.45, -0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
        <meshStandardMaterial color={C.gold} />
      </mesh>
      <mesh position={[-0.3, 7.5, 0.25]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 4]} />
        <meshStandardMaterial color="#A0B878" />
      </mesh>

      {/* ===================================================
          LAYER 4 — PAGODA TOWERS
          =================================================== */}
      <Tower position={[-1.5, 0, 1.5]} />
      <Tower position={[1.5, 0, -1.5]} />

      {/* ===================================================
          EXTRA DETAILS — floating blocks, accent pieces
          =================================================== */}
      <mesh position={[3.2, 8.5, 3.2]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={C.teal} {...G} />
      </mesh>
      <mesh position={[-3.0, 10.0, -1.5]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={C.pinkAccent} emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
