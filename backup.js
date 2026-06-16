const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

const SECRET_KEY = process.env.BACKUP_SECRET_KEY || 'Spadebotbackup';

app.get('/get-data', async (req, res) => {
    if (req.query.key !== SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized Access' });
    }
    
    try {
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        
        // --- AUTO-DETECT: Bina naam likhe current DB utha lega ---
        const db = client.db(); 
        const collections = await db.listCollections().toArray();
        
        let dbDump = {};
        for (let col of collections) {
            dbDump[col.name] = await db.collection(col.name).find({}).toArray();
        }
        
        await client.close();
        res.json(dbDump);
        
    } catch (error) {
        console.error("Backup Fetch Error:", error);
        res.status(500).json({ error: "Database fetch error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Spade Backup API running on port ${PORT}`);
});
