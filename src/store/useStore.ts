import { create } from "zustand";

// All navigable sections in the portfolio
export type Section =
  | "main"        // Default isometric view of the full monument
  | "arts"        // Door A: My Beloved Arts (sub-section selector)
  | "projects"    // Door B: My Projects (sub-section selector)
  | "about"       // About Me overlay
  | "dance"       // Arts → Dance
  | "gymnastics"  // Arts → Rhythmic Gymnastics
  | "music"       // Arts → Music
  | "articles"    // Projects → Articles (Medium)
  | "xposts"      // Projects → X Posts
  | "pastprojects"; // Projects → Past Projects

interface StoreState {
  // --- Navigation ---
  currentSection: Section;
  navigationHistory: Section[];
  navigateTo: (section: Section) => void;
  goBack: () => void;

  // --- Portal hover (for character look direction) ---
  hoveredSection: Section | null;
  setHoveredSection: (section: Section | null) => void;

  // --- Splash ---
  splashDone: boolean;
  setSplashDone: () => void;

  // --- Ring rotation (0, 90, 180, 270) ---
  ringRotation: number;
  setRingRotation: (deg: number) => void;

  // --- Character walking ---
  walkPath: string[] | null;
  setWalkPath: (path: string[] | null) => void;
  isWalking: boolean;
  setIsWalking: (v: boolean) => void;
  characterNodeId: string;
  setCharacterNodeId: (id: string) => void;
  walkTarget: Section | null;
  setWalkTarget: (section: Section | null) => void;

  // --- Audio ---
  isMuted: boolean;
  toggleMute: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // --- Navigation ---
  currentSection: "main",
  navigationHistory: [],

  navigateTo: (section: Section) => {
    const { currentSection, navigationHistory } = get();
    set({
      currentSection: section,
      navigationHistory: [...navigationHistory, currentSection],
    });
  },

  goBack: () => {
    const { navigationHistory } = get();
    if (navigationHistory.length === 0) return;
    const previous = navigationHistory[navigationHistory.length - 1];
    set({
      currentSection: previous,
      navigationHistory: navigationHistory.slice(0, -1),
    });
  },

  // --- Portal hover ---
  hoveredSection: null,
  setHoveredSection: (section) => set({ hoveredSection: section }),

  // --- Splash ---
  splashDone: false,
  setSplashDone: () => set({ splashDone: true }),

  // --- Ring rotation ---
  ringRotation: 0,
  setRingRotation: (deg) => set({ ringRotation: ((deg % 360) + 360) % 360 }),

  // --- Character walking ---
  walkPath: null,
  setWalkPath: (path) => set({ walkPath: path }),
  isWalking: false,
  setIsWalking: (v) => set({ isWalking: v }),
  characterNodeId: "home",
  setCharacterNodeId: (id) => set({ characterNodeId: id }),
  walkTarget: null,
  setWalkTarget: (section) => set({ walkTarget: section }),

  // --- Audio ---
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
