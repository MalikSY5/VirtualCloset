// ─────────────────────────────────────────────
//  Mock wardrobe data for Cher's Closet
// ─────────────────────────────────────────────

export type ClothingItem = {
  id: number;
  name: string;
  category: Category;
  color: string;      // hex swatch color
  tags: Occasion[];
  emoji: string;
  bg: string;         // card background hex
};

export type Category = "Tops" | "Bottoms" | "Dresses" | "Shoes" | "Accessories";
export type Occasion = "work" | "date night" | "movies" | "casual";

export const CATEGORIES: Array<"All" | Category> = [
  "All",
  "Tops",
  "Bottoms",
  "Dresses",
  "Shoes",
  "Accessories",
];

export const MOCK_CLOTHES: ClothingItem[] = [
  { id: 1,  name: "Plaid Blazer",      category: "Tops",        color: "#f5c842", tags: ["work", "date night"],       emoji: "🧥", bg: "#fffbe6" },
  { id: 2,  name: "Mini Skirt",        category: "Bottoms",     color: "#f472b6", tags: ["date night", "movies"],     emoji: "👗", bg: "#fdf2f8" },
  { id: 3,  name: "White Knee Socks",  category: "Accessories", color: "#e5e7eb", tags: ["movies", "casual"],         emoji: "🧦", bg: "#f9fafb" },
  { id: 4,  name: "Platform Loafers",  category: "Shoes",       color: "#a78bfa", tags: ["work", "date night"],       emoji: "👞", bg: "#f5f3ff" },
  { id: 5,  name: "Crop Cardigan",     category: "Tops",        color: "#34d399", tags: ["casual", "movies"],         emoji: "🧶", bg: "#ecfdf5" },
  { id: 6,  name: "Slip Dress",        category: "Dresses",     color: "#fbbf24", tags: ["date night"],               emoji: "👘", bg: "#fffbeb" },
  { id: 7,  name: "Plaid Trousers",    category: "Bottoms",     color: "#60a5fa", tags: ["work"],                     emoji: "👖", bg: "#eff6ff" },
  { id: 8,  name: "Fluffy Bag",        category: "Accessories", color: "#f9a8d4", tags: ["date night", "movies"],     emoji: "👜", bg: "#fdf2f8" },
  { id: 9,  name: "Denim Jacket",      category: "Tops",        color: "#93c5fd", tags: ["casual", "movies"],         emoji: "🧥", bg: "#eff6ff" },
  { id: 10, name: "Strappy Heels",     category: "Shoes",       color: "#fca5a5", tags: ["date night"],               emoji: "👡", bg: "#fff1f2" },
  { id: 11, name: "Beret",             category: "Accessories", color: "#c4b5fd", tags: ["casual", "date night"],     emoji: "🎩", bg: "#f5f3ff" },
  { id: 12, name: "Tennis Skirt",      category: "Bottoms",     color: "#a7f3d0", tags: ["casual", "movies"],         emoji: "🩱", bg: "#ecfdf5" },
];

// ─────────────────────────────────────────────
//  Occasions
// ─────────────────────────────────────────────

export type OccasionConfig = {
  id: Occasion;
  label: string;
  icon: string;
  color: string;
};

export const OCCASIONS: OccasionConfig[] = [
  { id: "work",       label: "Work Slay",     icon: "💼", color: "#6366f1" },
  { id: "date night", label: "Date Night",    icon: "🌙", color: "#ec4899" },
  { id: "movies",     label: "Movie Night",   icon: "🎬", color: "#f59e0b" },
  { id: "casual",     label: "Casual Vibes",  icon: "✌️", color: "#10b981" },
];

// ─────────────────────────────────────────────
//  Pre-built AI outfit suggestions (fallback /
//  offline mode — used when API is unavailable)
// ─────────────────────────────────────────────

export type AiOutfit = {
  items: number[];   // ClothingItem ids
  caption: string;
  rating: string;
};

export const AI_OUTFITS: Record<Occasion, AiOutfit> = {
  work: {
    items: [1, 7, 4, 11],
    caption:
      "As if you weren't already the most put-together person in the office! This plaid moment is *chef's kiss* for crushing that presentation.",
    rating: "10/10 would hire",
  },
  "date night": {
    items: [6, 10, 8, 11],
    caption:
      "Whatever! You look totally Baldwinn. This slip dress energy screams 'I woke up like this' but like, clearly you did NOT.",
    rating: "Ugh, as if they won't be obsessed",
  },
  movies: {
    items: [5, 12, 3, 9],
    caption:
      "You're a total Monet from far away — but up close this outfit is even better. Comfy AND cute? That's a full-on Cinderella story.",
    rating: "Major cozy vibes ✨",
  },
  casual: {
    items: [9, 12, 3, 5],
    caption:
      "I'm totally bugging — in the best way. This is giving 'I just threw this on' but we ALL know it took exactly 47 minutes.",
    rating: "Brutally casual, brutally cute",
  },
};
