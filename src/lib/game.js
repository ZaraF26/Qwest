import { base44 } from "@/api/base44Client";
import {
  calcQuestValue, calcLevel, rollReward, todayStr, isSameDay, isYesterday,
  MAP_LOCATIONS, ACHIEVEMENTS, TRINKETS,
} from "@/lib/qwest";

// Keys are awarded at XP milestones, then spent at doors.
const KEY_MILESTONES = [
  { xp: 420, key: "old_iron_key", name: "Old Iron Key", emoji: "🗝️", rarity: "rare", description: "Heavy, rust-flecked, warm." },
  { xp: 1000, key: "brass_key", name: "Brass Key", emoji: "🗝️", rarity: "epic", description: "Polished by a hundred hands." },
  { xp: 2300, key: "moon_key", name: "Moonlit Key", emoji: "🗝️", rarity: "legendary", description: "Cold as a winter moon." },
];

export async function loadProfile() {
  const list = await base44.entities.Profile.filter({}, "-created_date", 1);
  return list[0] || null;
}

export async function createProfile({ companion, display_name }) {
  const profile = await base44.entities.Profile.create({ companion, display_name });
  await base44.entities.MapLocation.bulkCreate(
    MAP_LOCATIONS.map((l) => ({
      order: l.order,
      name: l.name,
      region: l.region,
      description: l.description,
      required_xp: l.required_xp,
      icon: l.icon,
      pos_x: l.x,
      pos_y: l.y,
      required_key: l.required_key || null,
      unlocked: l.required_xp === 0,
      discovered_date: l.required_xp === 0 ? todayStr() : null,
    }))
  );
  return profile;
}

export async function updateProfileFields(profile, patch) {
  const updated = await base44.entities.Profile.update(profile.id, patch);
  return updated;
}

// Seed today's intention
export async function setDailyIntention(text) {
  const date = todayStr();
  const existing = await base44.entities.DailyIntention.filter({ date }, "-created_date", 1);
  if (existing[0]) {
    return base44.entities.DailyIntention.update(existing[0].id, { intention: text });
  }
  return base44.entities.DailyIntention.create({ date, intention: text });
}

export async function getTodaysIntention() {
  const list = await base44.entities.DailyIntention.filter({ date: todayStr() }, "-created_date", 1);
  return list[0]?.intention || null;
}

export async function getTodaysQuests() {
  const date = todayStr();
  return base44.entities.Quest.filter({ scheduled_date: date }, "created_date");
}

// Complete a quest: grants XP/gold, maybe a trinket, updates streak/totals,
// unlocks map locations, awards milestone keys, grants achievements.
// Returns a summary object for the reward modal.
export async function completeQuest(quest, profile) {
  const today = todayStr();
  const xpGain = quest.xp_value || 0;
  const goldGain = quest.gold_value || 0;
  const oldLevel = calcLevel(profile.xp || 0).level;
  const newXp = (profile.xp || 0) + xpGain;
  const newLevel = calcLevel(newXp).level;
  const leveledUp = newLevel > oldLevel;

  // Streak: only changes once per new day
  let streak = profile.streak || 0;
  let longest = profile.longest_streak || 0;
  if (!isSameDay(profile.last_active_date)) {
    if (isYesterday(profile.last_active_date)) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
  }

  const total_quests = (profile.total_quests || 0) + 1;
  const total_main = (profile.total_main || 0) + (quest.type === "main" ? 1 : 0);
  const total_side = (profile.total_side || 0) + (quest.type === "side" ? 1 : 0);
  const timed_quests = (profile.timed_quests || 0) + (quest.used_timer ? 1 : 0);

  // Reward trinket
  let reward = null;
  if (quest.type === "main" ? Math.random() < 0.7 : Math.random() < 0.4) {
    reward = rollReward(newLevel);
  }
  if (reward) {
    await base44.entities.InventoryItem.create({
      name: reward.name,
      description: reward.description,
      category: reward.category,
      rarity: reward.rarity,
      emoji: reward.emoji,
      is_key: false,
      date_collected: today,
    });
  }

  // Update quest record
  await base44.entities.Quest.update(quest.id, {
    status: "completed",
    completed_date: today,
    reward_item: reward ? reward.name : null,
  });

  // Update profile
  const updatedProfile = await base44.entities.Profile.update(profile.id, {
    xp: newXp,
    gold: (profile.gold || 0) + goldGain,
    level: newLevel,
    streak,
    longest_streak: longest,
    last_active_date: today,
    total_quests,
    total_main,
    total_side,
    timed_quests,
  });

  // Unlock non-key-gated map locations now reachable
  const allLocations = await base44.entities.MapLocation.list("order");
  const toUnlock = allLocations.filter(
    (l) => !l.unlocked && !l.required_key && newXp >= l.required_xp
  );
  if (toUnlock.length) {
    await base44.entities.MapLocation.bulkUpdate(
      toUnlock.map((l) => ({ id: l.id, unlocked: true, discovered_date: today }))
    );
  }

  // Award milestone keys (once each)
  const ownedItems = await base44.entities.InventoryItem.list();
  const ownedKeys = new Set(ownedItems.filter((i) => i.is_key).map((i) => i.name));
  const newKeys = [];
  for (const m of KEY_MILESTONES) {
    if (newXp >= m.xp && !ownedKeys.has(m.name)) {
      await base44.entities.InventoryItem.create({
        name: m.name,
        description: m.description,
        category: "Keys",
        rarity: m.rarity,
        emoji: m.emoji,
        is_key: true,
        date_collected: today,
      });
      newKeys.push(m);
    }
  }

  // Achievements
  const newAchievements = await checkAchievements(updatedProfile, quest, toUnlock.length, leveledUp, newLevel);

  return {
    xp: xpGain,
    gold: goldGain,
    reward,
    leveledUp,
    newLevel,
    newLocations: toUnlock.map((l) => l.name),
    newKeys,
    newAchievements,
    profile: updatedProfile,
  };
}

async function checkAchievements(profile, quest, newLocationsCount, leveledUp, newLevel) {
  const existing = await base44.entities.Achievement.list();
  const have = new Set(existing.map((a) => a.key));
  const grants = [];

  const should = (key) => !have.has(key) && grants.push(key);

  if ((profile.total_quests || 0) >= 1) should("first_quest");
  if ((profile.total_side || 0) >= 25) should("little_helper");
  if (newLocationsCount > 0) should("forest_walker");
  if ((profile.timed_quests || 0) >= 10) should("keeper_of_time");
  if ((profile.streak || 0) >= 7) should("week_streak");
  if (newLevel >= 5) should("level_five");

  // three_paths: 3 main quests completed today
  const todayMain = await base44.entities.Quest.filter({
    status: "completed", completed_date: todayStr(), type: "main",
  });
  if (todayMain.length >= 3) should("three_paths");

  // treasure_hunter: 25 unique trinkets
  const items = await base44.entities.InventoryItem.list();
  const unique = new Set(items.map((i) => i.name));
  if (unique.size >= 25) should("treasure_hunter");

  const created = [];
  for (const key of grants) {
    const def = ACHIEVEMENTS.find((a) => a.key === key);
    if (!def) continue;
    const a = await base44.entities.Achievement.create({
      key: def.key,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked_date: todayStr(),
    });
    created.push(a);
  }
  return created;
}

// Use a key on a key-gated, xp-qualified location
export async function useKeyOnLocation(location, profile) {
  if (!location.required_key) return { ok: false, reason: "no_key_needed" };
  if (profile.xp < location.required_xp) return { ok: false, reason: "not_enough_xp" };
  const keys = await base44.entities.InventoryItem.filter({ name: location.required_key, is_key: true });
  if (!keys.length) return { ok: false, reason: "missing_key" };
  // consume the key
  await base44.entities.InventoryItem.delete(keys[0].id);
  await base44.entities.MapLocation.update(location.id, {
    unlocked: true,
    discovered_date: todayStr(),
  });
  return { ok: true, consumedKey: location.required_key };
}