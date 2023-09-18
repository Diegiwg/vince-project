-- CreateTable
CREATE TABLE "CharacterBase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "mp" INTEGER NOT NULL,
    "sp" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "vitality" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "spirituality" INTEGER NOT NULL
);
