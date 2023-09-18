/*
  Warnings:

  - You are about to drop the column `class` on the `CharacterBase` table. All the data in the column will be lost.
  - Added the required column `classe` to the `CharacterBase` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CharacterBase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "mp" INTEGER NOT NULL,
    "sp" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "vitality" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "spirituality" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "CharacterBase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CharacterBase" ("agility", "experience", "hp", "id", "intelligence", "mp", "name", "race", "sp", "spirituality", "strength", "user_id", "vitality") SELECT "agility", "experience", "hp", "id", "intelligence", "mp", "name", "race", "sp", "spirituality", "strength", "user_id", "vitality" FROM "CharacterBase";
DROP TABLE "CharacterBase";
ALTER TABLE "new_CharacterBase" RENAME TO "CharacterBase";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
