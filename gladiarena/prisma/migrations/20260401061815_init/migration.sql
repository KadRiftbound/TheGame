-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "premiumUntil" DATETIME,
    "actionCount" INTEGER NOT NULL DEFAULT 0,
    "lastActionAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subclassLevel" INTEGER NOT NULL DEFAULT 1,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xpToNextLevel" INTEGER NOT NULL DEFAULT 100,
    "currentHp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "gold" INTEGER NOT NULL DEFAULT 50,
    "unspentPoints" INTEGER NOT NULL DEFAULT 5,
    "currentZoneId" TEXT,
    "equippedWeapon" TEXT,
    "equippedShield" TEXT,
    "equippedHelmet" TEXT,
    "equippedArmor" TEXT,
    "equippedLegs" TEXT,
    "equippedAccessory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Character_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CharacterClass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "baseBonuses" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "CharacterStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "force" INTEGER NOT NULL DEFAULT 10,
    "agility" INTEGER NOT NULL DEFAULT 10,
    "vitality" INTEGER NOT NULL DEFAULT 10,
    "luck" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "CharacterStats_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "type" TEXT NOT NULL,
    "effect" TEXT NOT NULL DEFAULT '{}',
    "cooldown" INTEGER NOT NULL DEFAULT 0,
    "manaCost" INTEGER NOT NULL DEFAULT 0,
    "dropRate" REAL NOT NULL DEFAULT 0.01,
    CONSTRAINT "Skill_classId_fkey" FOREIGN KEY ("classId") REFERENCES "CharacterClass" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemBase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "levelReq" INTEGER NOT NULL DEFAULT 1,
    "modelUrl" TEXT,
    "iconUrl" TEXT,
    "defaultRarity" TEXT NOT NULL DEFAULT 'common'
);

-- CreateTable
CREATE TABLE "ItemPrefix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bonuses" TEXT NOT NULL DEFAULT '{}',
    "rarity" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ItemSuffix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bonuses" TEXT NOT NULL DEFAULT '{}',
    "rarity" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ItemRarity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "statMultiplier" REAL NOT NULL DEFAULT 1.0,
    "bonusStats" TEXT NOT NULL DEFAULT '{}',
    "dropRate" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseItemId" TEXT NOT NULL,
    "prefixId" TEXT,
    "suffixId" TEXT,
    "rarityId" TEXT NOT NULL,
    "finalStats" TEXT NOT NULL DEFAULT '{}',
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "uniqueOwner" TEXT,
    "uniqueName" TEXT,
    "itemLevel" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "droppedBy" TEXT,
    "craftedBy" TEXT,
    "marketPrice" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "ItemBase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_prefixId_fkey" FOREIGN KEY ("prefixId") REFERENCES "ItemPrefix" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_suffixId_fkey" FOREIGN KEY ("suffixId") REFERENCES "ItemSuffix" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "ItemRarity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "worldX" INTEGER NOT NULL DEFAULT 0,
    "worldY" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "unlockCondition" TEXT,
    "hiddenRoute" TEXT
);

-- CreateTable
CREATE TABLE "ZoneEnemy" (
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
    CONSTRAINT "ZoneEnemy_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leaderId" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "buildings" TEXT NOT NULL DEFAULT '{}',
    "activeBuffs" TEXT NOT NULL DEFAULT '[]',
    "ranking" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "contributedGold" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuildMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" DATETIME,
    CONSTRAINT "MarketListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "conditions" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '{}',
    "resetTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "QuestProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "currentProgress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "resetAt" DATETIME,
    CONSTRAINT "QuestProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArenaMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "winnerId" TEXT,
    "attackerDamageDealt" INTEGER NOT NULL DEFAULT 0,
    "defenderDamageDealt" INTEGER NOT NULL DEFAULT 0,
    "replay" TEXT NOT NULL DEFAULT '[]',
    "attackerEloBefore" INTEGER NOT NULL DEFAULT 1000,
    "attackerEloAfter" INTEGER NOT NULL DEFAULT 1000,
    "defenderEloBefore" INTEGER NOT NULL DEFAULT 1000,
    "defenderEloAfter" INTEGER NOT NULL DEFAULT 1000,
    "foughtAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ArenaRanking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT DEFAULT '{}',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterClass_name_key" ON "CharacterClass"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStats_characterId_key" ON "CharacterStats"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemRarity_name_key" ON "ItemRarity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_characterId_slot_key" ON "InventoryItem"("characterId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_characterId_key" ON "GuildMember"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestProgress_characterId_questId_key" ON "QuestProgress"("characterId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaRanking_characterId_key" ON "ArenaRanking"("characterId");
