const db = require('better-sqlite3')('./prisma/dev.db')
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
tables.forEach(t => console.log(t.name))
db.close()