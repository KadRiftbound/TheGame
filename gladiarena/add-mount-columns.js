const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

db.exec(`
  ALTER TABLE Character ADD COLUMN equippedMount TEXT;
  ALTER TABLE Character ADD COLUMN currentMount TEXT;
  ALTER TABLE Character ADD COLUMN mountSpeedBonus INTEGER DEFAULT 0;
  ALTER TABLE ItemBase ADD COLUMN mountType TEXT;
  ALTER TABLE ItemBase ADD COLUMN mountSpeed INTEGER;
`);

console.log('Mount columns added successfully');
db.close();
