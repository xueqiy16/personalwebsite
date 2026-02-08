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

  // --- Audio ---
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
