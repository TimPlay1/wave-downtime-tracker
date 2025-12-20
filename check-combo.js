const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://wavechat:cEUFh98XT8jnz72@cluster0.icmtcjp.mongodb.net/wave-chat?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wave-chat');
    const cache = await db.collection('waveCache').findOne({ _id: 'current' });
    console.log('robloxUpdateCombo:', cache.robloxUpdateCombo);
    console.log('comboLocked:', cache.comboLocked);
    console.log('robloxVersionAtDownStart:', cache.robloxVersionAtDownStart);
    console.log('lastUpdated:', new Date(cache.lastUpdated).toISOString());
    await client.close();
}

check().catch(console.error);
