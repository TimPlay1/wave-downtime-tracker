const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://wavechat:cEUFh98XT8jnz72@cluster0.icmtcjp.mongodb.net/wave-chat?retryWrites=true&w=majority&appName=Cluster0';

// Usage: node set-combo.js [combo_value]
// Example: node set-combo.js 4
const comboValue = parseInt(process.argv[2]) || 4;

async function setCombo() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wave-chat');
    
    // First get current Roblox version to sync
    const robloxResp = await fetch('https://weao.xyz/api/versions/current', {
        headers: { 'User-Agent': 'WEAO-3PService' }
    });
    const robloxData = await robloxResp.json();
    const currentRobloxVersion = robloxData.Windows;
    
    await db.collection('waveCache').updateOne(
        { _id: 'current' },
        { 
            $set: { 
                robloxUpdateCombo: comboValue,
                comboLocked: false, // NOT locked - will grow automatically on Roblox updates
                robloxVersionAtDownStart: currentRobloxVersion, // Sync to current version
                lastUpdated: Date.now(),
                _lastModifiedBy: 'local-set-combo-script'
            } 
        }
    );
    
    const cache = await db.collection('waveCache').findOne({ _id: 'current' });
    console.log('✅ Updated:');
    console.log('  robloxUpdateCombo:', cache.robloxUpdateCombo);
    console.log('  comboLocked:', cache.comboLocked);
    console.log('  robloxVersionAtDownStart:', cache.robloxVersionAtDownStart);
    console.log('  currentRobloxVersion:', currentRobloxVersion);
    
    await client.close();
}

setCombo().catch(console.error);
