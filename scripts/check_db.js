const db = require('../db');

async function checkClient() {
    try {
        const [rows] = await db.query("SELECT * FROM pelunasan LIMIT 5");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkClient();
