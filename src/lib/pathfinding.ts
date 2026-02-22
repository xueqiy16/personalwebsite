/**
 * Graph-based A* pathfinding for the Monument Valley navigation system.
 *
 * The monument has fixed staircases and a rotatable middle ring with two
 * bridges. Bridges create/break connections based on the ring's rotation
 * (0°, 90°, 180°, 270°).
 *
 * Bridge availability by ring rotation:
 *   0°   → +Z bridge (Arts) ✓,  +X bridge (Projects) ✓
 *   90°  → +Z ✗,                 +X ✓
 *   180° → +Z ✗,                 +X ✗
 *   270° → +Z ✓,                 +X ✗
 */

// ── Types ─────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  position: [number, number, number];
}

export interface GraphEdge {
  from: string;
  to: string;
  /** Edge only exists when a bridge is present at this direction */
  bridgeDir?: "pz" | "px";
}

// ── Node graph ────────────────────────────────────────────────

export const NODES: GraphNode[] = [
  // Character home (terrace center)
  { id: "home", position: [0, 7.05, 0] },

  // Terrace platform (Y ≈ 7.0)
  { id: "terrace-c", position: [0, 7.05, 0] },
  { id: "terrace-pz", position: [0, 7.05, 2.0] },
  { id: "terrace-px", position: [2.0, 7.05, 0] },
  { id: "terrace-nz", position: [0, 7.05, -1.2] },

  // Upper stairs — +Z face (terrace → ring bridge level)
  { id: "ustair-z1", position: [0.2, 6.5, 2.5] },
  { id: "ustair-z2", position: [0.1, 5.95, 2.75] },
  { id: "uz-landing", position: [0, 5.4, 3.05] },

  // Upper stairs — +X face (terrace → ring bridge level)
  { id: "ustair-x1", position: [2.5, 6.5, 0.2] },
  { id: "ustair-x2", position: [2.75, 5.95, 0.1] },
  { id: "ux-landing", position: [3.05, 5.85, 0] },

  // Lower stairs — +Z (ring → base → Arts door)
  { id: "lstair-z1", position: [0, 4.2, 3.05] },
  { id: "lstair-z2", position: [-0.3, 3.3, 3.15] },
  { id: "lstair-z3", position: [-0.6, 2.3, 3.25] },
  { id: "lstair-z4", position: [-0.85, 1.3, 3.35] },
  { id: "arts-door", position: [-1.0, 0.5, 3.3] },

  // Lower stairs — +X (ring → base → Projects door)
  { id: "lstair-x1", position: [3.05, 4.2, 0] },
  { id: "lstair-x2", position: [3.15, 3.3, -0.3] },
  { id: "lstair-x3", position: [3.25, 2.3, -0.6] },
  { id: "lstair-x4", position: [3.35, 1.3, -0.85] },
  { id: "projects-door", position: [3.3, 0.5, -1.0] },

  // Tower stairs — terrace up to About Me
  { id: "tower-s1", position: [0, 7.7, -1.25] },
  { id: "tower-s2", position: [0, 8.4, -0.9] },
  { id: "tower-s3", position: [0, 9.1, -0.4] },
  { id: "about-dest", position: [0, 9.5, 0] },
];

export const EDGES: GraphEdge[] = [
  // Home ↔ terrace
  { from: "home", to: "terrace-c" },

  // Terrace internal
  { from: "terrace-c", to: "terrace-pz" },
  { from: "terrace-c", to: "terrace-px" },
  { from: "terrace-c", to: "terrace-nz" },

  // Upper stairs +Z
  { from: "terrace-pz", to: "ustair-z1" },
  { from: "ustair-z1", to: "ustair-z2" },
  { from: "ustair-z2", to: "uz-landing" },

  // Upper stairs +X
  { from: "terrace-px", to: "ustair-x1" },
  { from: "ustair-x1", to: "ustair-x2" },
  { from: "ustair-x2", to: "ux-landing" },

  // ── Bridge edges (rotation-dependent) ──
  { from: "uz-landing", to: "lstair-z1", bridgeDir: "pz" },
  { from: "ux-landing", to: "lstair-x1", bridgeDir: "px" },

  // Lower stairs +Z → Arts
  { from: "lstair-z1", to: "lstair-z2" },
  { from: "lstair-z2", to: "lstair-z3" },
  { from: "lstair-z3", to: "lstair-z4" },
  { from: "lstair-z4", to: "arts-door" },

  // Lower stairs +X → Projects
  { from: "lstair-x1", to: "lstair-x2" },
  { from: "lstair-x2", to: "lstair-x3" },
  { from: "lstair-x3", to: "lstair-x4" },
  { from: "lstair-x4", to: "projects-door" },

  // Tower stairs → About Me
  { from: "terrace-nz", to: "tower-s1" },
  { from: "tower-s1", to: "tower-s2" },
  { from: "tower-s2", to: "tower-s3" },
  { from: "tower-s3", to: "about-dest" },
];

// ── Bridge logic ──────────────────────────────────────────────

function hasBridgeAt(dir: "pz" | "px", rotation: number): boolean {
  const r = ((rotation % 360) + 360) % 360;
  if (dir === "pz") return r === 0 || r === 270;
  if (dir === "px") return r === 0 || r === 90;
  return false;
}

// ── Portal → destination node ─────────────────────────────────

export const PORTAL_DEST: Record<string, string> = {
  arts: "arts-door",
  projects: "projects-door",
  about: "about-dest",
};

// ── Lookup helpers ────────────────────────────────────────────

const nodeMap = new Map(NODES.map((n) => [n.id, n]));

export function getNode(id: string): GraphNode | undefined {
  return nodeMap.get(id);
}

function euclidean(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

function getNeighbors(nodeId: string, ringRotation: number): string[] {
  const result: string[] = [];
  for (const e of EDGES) {
    let neighbor: string | null = null;
    if (e.from === nodeId) neighbor = e.to;
    else if (e.to === nodeId) neighbor = e.from;
    if (!neighbor) continue;
    if (e.bridgeDir && !hasBridgeAt(e.bridgeDir, ringRotation)) continue;
    result.push(neighbor);
  }
  return result;
}

// ── A* pathfinding ────────────────────────────────────────────

export function findPath(
  fromId: string,
  toId: string,
  ringRotation: number,
): string[] | null {
  const start = nodeMap.get(fromId);
  const goal = nodeMap.get(toId);
  if (!start || !goal) return null;

  const openSet = new Set<string>([fromId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>([[fromId, 0]]);
  const fScore = new Map<string, number>([
    [fromId, euclidean(start.position, goal.position)],
  ]);

  while (openSet.size > 0) {
    let current = "";
    let bestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        current = id;
      }
    }

    if (current === toId) {
      const path: string[] = [current];
      let c = current;
      while (cameFrom.has(c)) {
        c = cameFrom.get(c)!;
        path.unshift(c);
      }
      return path;
    }

    openSet.delete(current);
    const cNode = nodeMap.get(current)!;

    for (const nId of getNeighbors(current, ringRotation)) {
      const nNode = nodeMap.get(nId);
      if (!nNode) continue;

      const tentG =
        (gScore.get(current) ?? Infinity) +
        euclidean(cNode.position, nNode.position);

      if (tentG < (gScore.get(nId) ?? Infinity)) {
        cameFrom.set(nId, current);
        gScore.set(nId, tentG);
        fScore.set(nId, tentG + euclidean(nNode.position, goal.position));
        openSet.add(nId);
      }
    }
  }

  return null;
}
