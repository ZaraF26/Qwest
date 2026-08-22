// ===== Qwest game logic & content =====
// No occult/symbolic imagery — only objects & environments.

export const COMPANIONS = [
  { key: "fox", name: "Fox", emoji: "🦊", blurb: "Clever and quick on the trail." },
  { key: "rabbit", name: "Rabbit", emoji: "🐰", blurb: "Gentle, hopeful, and full of bounce." },
  { key: "hedgehog", name: "Hedgehog", emoji: "🦔", blurb: "Small but determined." },
  { key: "squirrel", name: "Squirrel", emoji: "🐿️", blurb: "A diligent little gatherer." },
  { key: "deer", name: "Deer", emoji: "🦌", blurb: "Quiet, graceful, and watchful." },
  { key: "raccoon", name: "Raccoon", emoji: "🦝", blurb: "Curious about every corner." },
  { key: "owl", name: "Owl", emoji: "🦉", blurb: "Wise and steady through the dark." },
  { key: "badger", name: "Badger", emoji: "🦡", blurb: "Steadfast and never gives up." },
  { key: "mouse", name: "Mouse", emoji: "🐭", blurb: "Tiny, brave, and resourceful." },
  { key: "cat", name: "Cat", emoji: "🐈‍⬛", blurb: "Independent and quietly magical." },
  { key: "crow", name: "Crow", emoji: "🐦‍⬛", blurb: "Sharp-eyed collector of shiny things." },
  { key: "frog", name: "Frog", emoji: "🐸", blurb: "Easygoing, at home by the pond." },
  { key: "bird", name: "Woodland Bird", emoji: "🐦", blurb: "Light-hearted and free." },
];

export const CATEGORIES = [
  { key: "work", label: "Work", emoji: "💼", color: "moss" },
  { key: "study", label: "Study", emoji: "📖", color: "plum" },
  { key: "home", label: "Home", emoji: "🏡", color: "terracotta" },
  { key: "health", label: "Health", emoji: "💚", color: "moss" },
  { key: "personal", label: "Personal", emoji: "🕯️", color: "burgundy" },
  { key: "creative", label: "Creative", emoji: "🎨", color: "plum" },
  { key: "errands", label: "Errands", emoji: "🧺", color: "terracotta" },
  { key: "social", label: "Social", emoji: "☕", color: "gold" },
  { key: "selfcare", label: "Self-care", emoji: "🧉", color: "moss" },
];

export const DURATIONS = [
  { minutes: 5, label: "5 minutes" },
  { minutes: 10, label: "10 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 45, label: "45 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 120, label: "2+ hours" },
];

// ===== Levels =====
export const LEVELS = [
  { level: 1, title: "New Adventurer", xp: 0 },
  { level: 2, title: "Forest Wanderer", xp: 100 },
  { level: 3, title: "Pathfinder", xp: 250 },
  { level: 4, title: "Keeper of the Grove", xp: 500 },
  { level: 5, title: "Master of the Cottage", xp: 850 },
  { level: 6, title: "Warden of the Woods", xp: 1300 },
  { level: 7, title: "Sage of the Hollow", xp: 1900 },
  { level: 8, title: "Ancient of the Forest", xp: 2700 },
  { level: 9, title: "Keeper of Lost Paths", xp: 3700 },
  { level: 10, title: "Legend of the Quest", xp: 5000 },
];

export function calcLevel(totalXp) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i].xp) idx = i;
  }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const floor = current.xp;
  const ceil = next ? next.xp : current.xp;
  const intoLevel = totalXp - floor;
  const span = Math.max(1, ceil - floor);
  const progress = Math.min(1, intoLevel / span);
  return {
    level: current.level,
    title: current.title,
    intoLevel,
    span,
    needed: next ? ceil - totalXp : 0,
    progress,
    isMax: !next,
  };
}

// ===== Quest valuation (automatic, non-exploitable) =====
function durationMultiplier(minutes) {
  if (minutes <= 5) return 0.5;
  if (minutes <= 10) return 0.7;
  if (minutes <= 15) return 0.85;
  if (minutes <= 30) return 1.0;
  if (minutes <= 45) return 1.2;
  if (minutes <= 60) return 1.45;
  return 1.8; // 2h+
}

export function calcQuestValue(type, minutes) {
  const mult = durationMultiplier(minutes || 15);
  if (type === "main") {
    const xp = Math.round(45 * mult);
    return { xp, gold: Math.max(3, Math.round(xp * 0.25)) };
  }
  const xp = Math.round(10 * mult);
  return { xp, gold: Math.max(1, Math.round(xp * 0.2)) };
}

// ===== Trinket catalog =====
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
export const RARITY_META = {
  common: { label: "Common", color: "muted-foreground", ring: "border-border" },
  uncommon: { label: "Uncommon", color: "text-moss", ring: "border-moss/50" },
  rare: { label: "Rare", color: "text-blue-700", ring: "border-blue-400/50" },
  epic: { label: "Epic", color: "text-plum", ring: "border-plum/50" },
  legendary: { label: "Legendary", color: "text-gold", ring: "border-gold/60" },
};

export const COLLECTION_CATEGORIES = [
  "Herbs", "Flowers", "Crystals", "Potions", "Books", "Keys",
  "Coins", "Trinkets", "Baked Goods", "Feathers", "Miscellaneous",
];

// Each: { name, category, rarity, emoji, description }
export const TRINKETS = [
  // Herbs (common)
  { name: "Sprig of Rosemary", category: "Herbs", rarity: "common", emoji: "🌿", description: "A fragrant sprig, picked at dawn." },
  { name: "Bundle of Thyme", category: "Herbs", rarity: "common", emoji: "🌿", description: "Tied with twine from the garden." },
  { name: "Mint Leaves", category: "Herbs", rarity: "common", emoji: "🌿", description: "Cool and bright, still dewy." },
  { name: "Wild Sage", category: "Herbs", rarity: "uncommon", emoji: "🌿", description: "Soft grey-green leaves of wisdom." },
  { name: "Lavender Stalk", category: "Herbs", rarity: "uncommon", emoji: "🌿", description: "Calm in a single stem." },
  // Flowers
  { name: "Wild Heather", category: "Flowers", rarity: "common", emoji: "🌸", description: "A whisper of the meadow." },
  { name: "Buttercup", category: "Flowers", rarity: "common", emoji: "🌼", description: "Holds a drop of sunlight." },
  { name: "Foxglove", category: "Flowers", rarity: "uncommon", emoji: "💐", description: "Tall, speckled, and lovely." },
  { name: "Moon Petal", category: "Flowers", rarity: "rare", emoji: "🌸", description: "Glows faintly in the dark." },
  // Crystals
  { name: "Pebble Crystal", category: "Crystals", rarity: "uncommon", emoji: "💎", description: "A small, clear stone." },
  { name: "Moss Agate", category: "Crystals", rarity: "uncommon", emoji: "💎", description: "Green as the forest floor." },
  { name: "Amethyst Shard", category: "Crystals", rarity: "rare", emoji: "💎", description: "Deep and quietly luminous." },
  { name: "Rose Quartz", category: "Crystals", rarity: "rare", emoji: "💎", description: "Warm to the touch." },
  { name: "Heart of the Hollow", category: "Crystals", rarity: "legendary", emoji: "💎", description: "Said to hum when the forest is content." },
  // Potions
  { name: "Tiny Potion Bottle", category: "Potions", rarity: "uncommon", emoji: "🧪", description: "Corked and bubbling gently." },
  { name: "Dewdrop Elixir", category: "Potions", rarity: "rare", emoji: "🧪", description: "Clear as morning rain." },
  { name: "Honey Tonic", category: "Potions", rarity: "rare", emoji: "🧪", description: "Golden and soothing." },
  { name: "Starlight Brew", category: "Potions", rarity: "epic", emoji: "🧪", description: "Faintly glows from within." },
  // Books
  { name: "Worn Field Notebook", category: "Books", rarity: "uncommon", emoji: "📓", description: "Half-filled with sketches." },
  { name: "Book of Recipes", category: "Books", rarity: "rare", emoji: "📕", description: "Stains on every page." },
  { name: "Ancient Tome", category: "Books", rarity: "epic", emoji: "📚", description: "Heavy, leatherbound, patient." },
  { name: "Forgotten Bestiary", category: "Books", rarity: "legendary", emoji: "📚", description: "Lists creatures no one has seen in years." },
  // Keys
  { key: "old_iron_key", name: "Old Iron Key", category: "Keys", rarity: "rare", emoji: "🗝️", description: "Heavy, rust-flecked, warm." },
  { key: "brass_key", name: "Brass Key", category: "Keys", rarity: "epic", emoji: "🗝️", description: "Polished by a hundred hands." },
  { key: "moon_key", name: "Moonlit Key", category: "Keys", rarity: "legendary", emoji: "🗝️", description: "Cold as a winter moon." },
  // Coins
  { name: "Copper Coin", category: "Coins", rarity: "common", emoji: "🪙", description: "Worn smooth by many pockets." },
  { name: "Silver Coin", category: "Coins", rarity: "uncommon", emoji: "🪙", description: "Catches light like water." },
  { name: "Gold Coin", category: "Coins", rarity: "rare", emoji: "🪙", description: "Warm and unexpectedly heavy." },
  // Trinkets
  { name: "Acorn", category: "Trinkets", rarity: "common", emoji: "🌰", description: "A small beginning." },
  { name: "Pinecone", category: "Trinkets", rarity: "common", emoji: "🌲", description: "Scales opening in the warmth." },
  { name: "Glass Marble", category: "Trinkets", rarity: "uncommon", emoji: "🔮", description: "A swirl of colour inside." },
  { name: "Brass Lantern", category: "Trinkets", rarity: "rare", emoji: "🏮", description: "Burns low and steady." },
  { name: "Wooden Chest", category: "Trinkets", rarity: "epic", emoji: "🧰", description: "Locked, but the lock is loose." },
  { name: "Silver Compass", category: "Trinkets", rarity: "legendary", emoji: "🧭", description: "Points where you most need to go." },
  // Baked Goods
  { name: "Honey Cake", category: "Baked Goods", rarity: "uncommon", emoji: "🧁", description: "Sweet and just-baked." },
  { name: "Crust of Bread", category: "Baked Goods", rarity: "common", emoji: "🍞", description: "Still warm from the oven." },
  { name: "Spiced Biscuit", category: "Baked Goods", rarity: "uncommon", emoji: "🍪", description: "Crumbles perfectly." },
  // Feathers
  { name: "Crow Feather", category: "Feathers", rarity: "common", emoji: "🪶", description: "Black and iridescent." },
  { name: "Owl Feather", category: "Feathers", rarity: "uncommon", emoji: "🪶", description: "Soft as a whisper." },
  { name: "Blue Jay Plume", category: "Feathers", rarity: "rare", emoji: "🪶", description: "Bright as a clear morning." },
  // Misc
  { name: "Ink Bottle", category: "Miscellaneous", rarity: "common", emoji: "🖋️", description: "Dark and ready for a quill." },
  { name: "Quill", category: "Miscellaneous", rarity: "uncommon", emoji: "🪶", description: "Trimmed and waiting." },
  { name: "Wax Candle", category: "Miscellaneous", rarity: "common", emoji: "🕯️", description: "A small, steady flame." },
  { name: "Mushroom Cap", category: "Miscellaneous", rarity: "common", emoji: "🍄", description: "Dotted and cheerful." },
  { name: "Toadstool", category: "Miscellaneous", rarity: "uncommon", emoji: "🍄", description: "Best left admired, not eaten." },
  { name: "Forest Map Scrap", category: "Miscellaneous", rarity: "rare", emoji: "🗺️", description: "A torn corner of something bigger." },
];

// Reward pool available to a user at a given level (gated by rarity)
function poolForLevel(level) {
  const allow = level <= 2 ? ["common"] : level <= 4 ? ["common", "uncommon"] : level <= 6 ? ["common", "uncommon", "rare"] : ["common", "uncommon", "rare", "epic"];
  return TRINKETS.filter((t) => allow.includes(t.rarity));
}

const RARITY_WEIGHT = { common: 60, uncommon: 28, rare: 9, epic: 3, legendary: 0.4 };

export function rollReward(level, ownedNames = []) {
  // 65% chance for a main quest, 35% for a side quest
  const pool = poolForLevel(level).filter((t) => t.category !== "Keys"); // keys are milestone-only
  if (pool.length === 0) return null;
  const totalWeight = pool.reduce((s, t) => s + (RARITY_WEIGHT[t.rarity] || 0), 0);
  let r = Math.random() * totalWeight;
  for (const t of pool) {
    r -= (RARITY_WEIGHT[t.rarity] || 0);
    if (r <= 0) return t;
  }
  return pool[0];
}

// ===== Map =====
// pos_x / pos_y are percentages on the map background (0-100)
export const MAP_LOCATIONS = [
  { order: 1, name: "The Cottage", region: "Home", required_xp: 0, icon: "🏡", x: 16, y: 78, description: "Your cosy starting point. The fire is always lit." },
  { order: 2, name: "Herb Garden", region: "Home", required_xp: 60, icon: "🌿", x: 30, y: 66, description: "Rows of rosemary, thyme, and mint." },
  { order: 3, name: "Whispering Woods", region: "Forest", required_xp: 140, icon: "🌲", x: 44, y: 54, description: "The trees murmur as you pass." },
  { order: 4, name: "Mushroom Grove", region: "Forest", required_xp: 240, icon: "🍄", x: 58, y: 64, description: "Toadstools taller than your knee." },
  { order: 5, name: "Heather Meadow", region: "Forest", required_xp: 360, icon: "🌸", x: 70, y: 50, description: "A wide purple sea of flowers." },
  { order: 6, name: "Old Library", region: "Village", required_xp: 500, icon: "📚", x: 82, y: 60, description: "Dusty shelves and a reading nook.", required_key: "old_iron_key" },
  { order: 7, name: "Potion Kitchen", region: "Village", required_xp: 680, icon: "🧪", x: 24, y: 44, description: "Bottles, bubbles, and a copper pot." },
  { order: 8, name: "Crow's Perch", region: "Village", required_xp: 880, icon: "🐦‍⬛", x: 40, y: 32, description: "A high roost overlooking the woods." },
  { order: 9, name: "Hidden Garden", region: "Deep Woods", required_xp: 1100, icon: "🌷", x: 56, y: 40, description: "Walled in and overgrown.", required_key: "brass_key" },
  { order: 10, name: "Crystal Cave", region: "Deep Woods", required_xp: 1350, icon: "💎", x: 72, y: 30, description: "Walls that catch every glimmer." },
  { order: 11, name: "Forgotten Path", region: "Deep Woods", required_xp: 1650, icon: "🍂", x: 86, y: 40, description: "Half-hidden under fallen leaves." },
  { order: 12, name: "Ancient Library", region: "The Hollow", required_xp: 2000, icon: "📕", x: 32, y: 22, description: "Older than the forest itself." },
  { order: 13, name: "Stone Gate", region: "The Hollow", required_xp: 2400, icon: "🚪", x: 54, y: 16, description: "Mossy and waiting.", required_key: "moon_key" },
  { order: 14, name: "Forest Clearing", region: "The Hollow", required_xp: 2900, icon: "🌳", x: 74, y: 14, description: "A quiet place where the journey rests." },
];

export function unlockedLocations(totalXp) {
  return MAP_LOCATIONS.filter((l) => totalXp >= l.required_xp);
}

// ===== Achievements =====
export const ACHIEVEMENTS = [
  { key: "first_quest", name: "First Quest", icon: "🍃", description: "Complete your first quest." },
  { key: "three_paths", name: "Three Paths", icon: "🌳", description: "Complete three Main Quests in one day." },
  { key: "little_helper", name: "Little Helper", icon: "🧺", description: "Complete 25 Side Quests." },
  { key: "forest_walker", name: "Forest Walker", icon: "🌲", description: "Reach a new map region." },
  { key: "treasure_hunter", name: "Treasure Hunter", icon: "🗝️", description: "Collect 25 unique trinkets." },
  { key: "keeper_of_time", name: "Keeper of Time", icon: "⏳", description: "Complete 10 timed quests." },
  { key: "week_streak", name: "Steady Wanderer", icon: "🔥", description: "Maintain a 7-day streak." },
  { key: "level_five", name: "Keeper of the Grove", icon: "📜", description: "Reach Level 5." },
];

// ===== Helpers =====
export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function isYesterday(dateStr, ref = new Date()) {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  const r = new Date(ref);
  r.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((r - d) / 86400000);
  return diff === 1;
}

export function isSameDay(dateStr, ref = new Date()) {
  if (!dateStr) return false;
  return dateStr === new Date(ref).toISOString().slice(0, 10);
}

export const FLAVOR = {
  complete: ["Quest complete!", "Your satchel grew heavier.", "The path thanks you.", "One step further along the trail."],
  reward: ["Your satchel gained a new treasure.", "Something glinted in the grass.", "Tucked safely away.", "A gift from the woods."],
  levelUp: "Your journey continues...",
  streakBreak: "Every adventure has quiet days.",
};