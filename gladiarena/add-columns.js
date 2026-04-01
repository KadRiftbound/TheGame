const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

db.exec(`
  ALTER TABLE Zone ADD COLUMN baseDamageType TEXT DEFAULT 'physical';
  ALTER TABLE Zone ADD COLUMN environmentalHazard INTEGER DEFAULT 0;
  ALTER TABLE Zone ADD COLUMN hasCorruption INTEGER DEFAULT 0;
  ALTER TABLE Zone ADD COLUMN healAvailability INTEGER DEFAULT 50;
  ALTER TABLE Zone ADD COLUMN trapDensity INTEGER DEFAULT 0;
  ALTER TABLE Zone ADD COLUMN goldMultiplier REAL DEFAULT 1.0;
  ALTER TABLE Zone ADD COLUMN itemDropRate REAL DEFAULT 0.1;
  ALTER TABLE Zone ADD COLUMN xpMultiplier REAL DEFAULT 1.0;
  ALTER TABLE Zone ADD COLUMN travelTimeSeconds INTEGER DEFAULT 300;
  ALTER TABLE Zone ADD COLUMN isHub INTEGER DEFAULT 0;
  ALTER TABLE Zone ADD COLUMN nearestSafePoint TEXT;
`);

console.log('Columns added successfully');
db.close();
