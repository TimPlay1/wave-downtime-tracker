const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://wavechat:cEUFh98XT8jnz72@cluster0.icmtcjp.mongodb.net/wave-chat?retryWrites=true&w=majority&appName=Cluster0';

async function fix() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wave-chat');
    
    // Fix combo to 4 and lock it
    await db.collection('waveCache').updateOne(
        { _id: 'current' },
        { 
            $set: { 
                robloxUpdateCombo: 4,
                comboLocked: true,
                lastUpdated: Date.now()
            } 
        }
    );
    
    // Verify
    const cache = await db.collection('waveCache').findOne({ _id: 'current' });
    console.log('Updated waveCache:');
    console.log('  robloxUpdateCombo:', cache.robloxUpdateCombo);
    console.log('  comboLocked:', cache.comboLocked);
    console.log('  robloxVersionAtDownStart:', cache.robloxVersionAtDownStart);
    
    await client.close();
    console.log('\n✅ Combo fixed to 4 and LOCKED!');
}
fix().catch(console.error);
