-- AlterTable
ALTER TABLE "ItemBase" ADD COLUMN "mountSpeed" INTEGER;
ALTER TABLE "ItemBase" ADD COLUMN "mountType" TEXT;

-- CreateTable
CREATE TABLE "Origin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "bonuses" TEXT NOT NULL DEFAULT '{}',
    "isSecret" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "HiddenTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "trackerType" TEXT NOT NULL,
    "zoneId" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HiddenTracker_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassUnlockEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "unlockType" TEXT NOT NULL,
    "conditionsMet" TEXT,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ClassUnlockEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reputation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "factionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "rank" TEXT NOT NULL DEFAULT 'neutral',
    CONSTRAINT "Reputation_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "choiceType" TEXT NOT NULL,
    "choiceId" TEXT NOT NULL,
    "consequence" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "madeAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerChoice_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TreasureChest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minGold" INTEGER NOT NULL DEFAULT 10,
    "maxGold" INTEGER NOT NULL DEFAULT 50,
    "minItems" INTEGER NOT NULL DEFAULT 0,
    "maxItems" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "unlockCondition" TEXT,
    "minPlayerLevel" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "TreasureChest_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "discoveryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hint" TEXT,
    "foundAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Discovery_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServerUniqueItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "rarity" TEXT NOT NULL DEFAULT 'legendary',
    "effect" TEXT NOT NULL DEFAULT '{}',
    "ownerId" TEXT,
    "claimedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ServerRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "targetId" TEXT,
    "zoneId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT NOT NULL,
    "placerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" DATETIME NOT NULL,
    "claimedAt" DATETIME,
    "claimedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originId" TEXT,
    "classId" TEXT NOT NULL,
    "subclassLevel" INTEGER NOT NULL DEFAULT 1,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xpToNextLevel" INTEGER NOT NULL DEFAULT 100,
    "currentHp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "wounds" TEXT NOT NULL DEFAULT '[]',
    "corruptionLevel" INTEGER NOT NULL DEFAULT 0,
    "fatigue" INTEGER NOT NULL DEFAULT 0,
    "baseStrength" INTEGER NOT NULL DEFAULT 10,
    "baseAgility" INTEGER NOT NULL DEFAULT 10,
    "baseVitality" INTEGER NOT NULL DEFAULT 10,
    "baseLuck" INTEGER NOT NULL DEFAULT 10,
    "strengthInvested" INTEGER NOT NULL DEFAULT 0,
    "agilityInvested" INTEGER NOT NULL DEFAULT 0,
    "vitalityInvested" INTEGER NOT NULL DEFAULT 0,
    "luckInvested" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 50,
    "victories" INTEGER NOT NULL DEFAULT 0,
    "defeats" INTEGER NOT NULL DEFAULT 0,
    "craftCount" INTEGER NOT NULL DEFAULT 0,
    "unspentPoints" INTEGER NOT NULL DEFAULT 5,
    "currentZoneId" TEXT,
    "equippedWeapon" TEXT,
    "equippedShield" TEXT,
    "equippedHelmet" TEXT,
    "equippedArmor" TEXT,
    "equippedLegs" TEXT,
    "equippedAccessory" TEXT,
    "equippedMount" TEXT,
    "currentMount" TEXT,
    "mountSpeedBonus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "secretFlags" TEXT NOT NULL DEFAULT '[]',
    "curses" TEXT NOT NULL DEFAULT '[]',
    "blessings" TEXT NOT NULL DEFAULT '[]',
    "titles" TEXT NOT NULL DEFAULT '[]',
    "forbiddenKnowledge" INTEGER NOT NULL DEFAULT 0,
    "deathsInSecretZone" INTEGER NOT NULL DEFAULT 0,
    "deathsInVolcan" INTEGER NOT NULL DEFAULT 0,
    "deathsInTombe" INTEGER NOT NULL DEFAULT 0,
    "deathsInOmbre" INTEGER NOT NULL DEFAULT 0,
    "pvpDefeats" INTEGER NOT NULL DEFAULT 0,
    "successfulSteals" INTEGER NOT NULL DEFAULT 0,
    "fledCombat" INTEGER NOT NULL DEFAULT 0,
    "wonFledCombat" INTEGER NOT NULL DEFAULT 0,
    "tradesRefused" INTEGER NOT NULL DEFAULT 0,
    "sacredChoicesRefused" INTEGER NOT NULL DEFAULT 0,
    "offersRefused" INTEGER NOT NULL DEFAULT 0,
    "betrayalsCommitted" INTEGER NOT NULL DEFAULT 0,
    "oathsTaken" INTEGER NOT NULL DEFAULT 0,
    "oathsBroken" INTEGER NOT NULL DEFAULT 0,
    "itemsDestroyed" INTEGER NOT NULL DEFAULT 0,
    "relicsCollected" INTEGER NOT NULL DEFAULT 0,
    "itemsBought" INTEGER NOT NULL DEFAULT 0,
    "itemsSold" INTEGER NOT NULL DEFAULT 0,
    "explorationsNoCombat" INTEGER NOT NULL DEFAULT 0,
    "hiddenZonesVisited" INTEGER NOT NULL DEFAULT 0,
    "secretChestsFound" INTEGER NOT NULL DEFAULT 0,
    "bossKilled" INTEGER NOT NULL DEFAULT 0,
    "bossSpared" INTEGER NOT NULL DEFAULT 0,
    "daysSinceStart" INTEGER NOT NULL DEFAULT 0,
    "consecutiveDaysPlayed" INTEGER NOT NULL DEFAULT 0,
    "moralAlignment" INTEGER NOT NULL DEFAULT 0,
    "chaosAlignment" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Character_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Origin" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("classId", "createdAt", "currentHp", "currentZoneId", "equippedAccessory", "equippedArmor", "equippedHelmet", "equippedLegs", "equippedShield", "equippedWeapon", "gold", "id", "level", "maxHp", "name", "subclassLevel", "unspentPoints", "updatedAt", "userId", "xp", "xpToNextLevel") SELECT "classId", "createdAt", "currentHp", "currentZoneId", "equippedAccessory", "equippedArmor", "equippedHelmet", "equippedLegs", "equippedShield", "equippedWeapon", "gold", "id", "level", "maxHp", "name", "subclassLevel", "unspentPoints", "updatedAt", "userId", "xp", "xpToNextLevel" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");
CREATE TABLE "new_CharacterClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "baseBonuses" TEXT NOT NULL DEFAULT '{}',
    "tier" TEXT NOT NULL DEFAULT 'base',
    "category" TEXT,
    "role" TEXT,
    "unlockHint" TEXT,
    "unlockCondition" TEXT,
    "prerequisites" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "maxPerServer" INTEGER,
    "primaryStrength" TEXT,
    "weakness" TEXT,
    "costToUnlock" TEXT,
    "specialAbility" TEXT,
    "forbiddenCombos" TEXT
);
INSERT INTO "new_CharacterClass" ("baseBonuses", "description", "icon", "id", "name") SELECT "baseBonuses", "description", "icon", "id", "name" FROM "CharacterClass";
DROP TABLE "CharacterClass";
ALTER TABLE "new_CharacterClass" RENAME TO "CharacterClass";
CREATE UNIQUE INDEX "CharacterClass_name_key" ON "CharacterClass"("name");
CREATE TABLE "new_Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conditions" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '{}',
    "resetTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSecret" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Quest" ("conditions", "description", "id", "isActive", "name", "resetTime", "rewards", "type") SELECT "conditions", "description", "id", "isActive", "name", "resetTime", "rewards", "type" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
CREATE TABLE "new_Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "worldX" INTEGER NOT NULL DEFAULT 0,
    "worldY" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "description" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "unlockCondition" TEXT,
    "hiddenRoute" TEXT,
    "baseDamageType" TEXT NOT NULL DEFAULT 'physical',
    "environmentalHazard" BOOLEAN NOT NULL DEFAULT false,
    "hasCorruption" BOOLEAN NOT NULL DEFAULT false,
    "healAvailability" INTEGER NOT NULL DEFAULT 50,
    "enemyAggroRange" INTEGER NOT NULL DEFAULT 10,
    "trapDensity" INTEGER NOT NULL DEFAULT 0,
    "goldMultiplier" REAL NOT NULL DEFAULT 1.0,
    "itemDropRate" REAL NOT NULL DEFAULT 0.1,
    "rareLootChance" REAL NOT NULL DEFAULT 0.01,
    "xpMultiplier" REAL NOT NULL DEFAULT 1.0,
    "travelTimeSeconds" INTEGER NOT NULL DEFAULT 300,
    "isHub" BOOLEAN NOT NULL DEFAULT false,
    "nearestSafePoint" TEXT
);
INSERT INTO "new_Zone" ("difficulty", "hiddenRoute", "id", "isHidden", "maxLevel", "minLevel", "name", "unlockCondition", "worldX", "worldY") SELECT "difficulty", "hiddenRoute", "id", "isHidden", "maxLevel", "minLevel", "name", "unlockCondition", "worldX", "worldY" FROM "Zone";
DROP TABLE "Zone";
ALTER TABLE "new_Zone" RENAME TO "Zone";
CREATE TABLE "new_ZoneEnemy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "goldReward" INTEGER NOT NULL,
    "spawnWeight" INTEGER NOT NULL DEFAULT 1,
    "isElite" BOOLEAN NOT NULL DEFAULT false,
    "isBoss" BOOLEAN NOT NULL DEFAULT false,
    "enemyType" TEXT NOT NULL DEFAULT 'normal',
    CONSTRAINT "ZoneEnemy_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ZoneEnemy" ("attack", "defense", "goldReward", "hp", "id", "isBoss", "isElite", "level", "name", "spawnWeight", "xpReward", "zoneId") SELECT "attack", "defense", "goldReward", "hp", "id", "isBoss", "isElite", "level", "name", "spawnWeight", "xpReward", "zoneId" FROM "ZoneEnemy";
DROP TABLE "ZoneEnemy";
ALTER TABLE "new_ZoneEnemy" RENAME TO "ZoneEnemy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Origin_name_key" ON "Origin"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenTracker_characterId_trackerType_zoneId_key" ON "HiddenTracker"("characterId", "trackerType", "zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Reputation_characterId_factionId_key" ON "Reputation"("characterId", "factionId");

-- CreateIndex
CREATE UNIQUE INDEX "TreasureChest_zoneId_name_key" ON "TreasureChest"("zoneId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Discovery_characterId_type_discoveryId_key" ON "Discovery"("characterId", "type", "discoveryId");

-- CreateIndex
CREATE UNIQUE INDEX "ServerUniqueItem_name_key" ON "ServerUniqueItem"("name");
