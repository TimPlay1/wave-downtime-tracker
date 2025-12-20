const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://wavechat:cEUFh98XT8jnz72@cluster0.icmtcjp.mongodb.net/wave-chat?retryWrites=true&w=majority&appName=Cluster0';

async function monitor() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wave-chat');
    
    // Set combo to 4 first
    await db.collection('waveCache').updateOne(
        { _id: 'current' },
        { $set: { robloxUpdateCombo: 4, comboLocked: true } }
    );
    console.log('Set combo to 4, locked=true at', new Date().toISOString());
    
    let lastCombo = 4;
    let lastUpdated = null;
    
    // Check every 5 seconds
    const interval = setInterval(async () => {
        const cache = await db.collection('waveCache').findOne({ _id: 'current' });
        const now = new Date().toISOString();
        
        if (cache.robloxUpdateCombo !== lastCombo || cache.lastUpdated !== lastUpdated) {
            console.log(`[${now}] CHANGED! combo: ${lastCombo} -> ${cache.robloxUpdateCombo}, locked: ${cache.comboLocked}`);
            console.log(`  lastUpdated: ${new Date(cache.lastUpdated).toISOString()}`);
            lastCombo = cache.robloxUpdateCombo;
            lastUpdated = cache.lastUpdated;
        }
    }, 5000);
    
    // Run for 3 minutes
    setTimeout(async () => {
        clearInterval(interval);
        await client.close();
        console.log('Done monitoring');
    }, 180000);
}

monitor().catch(console.error);
