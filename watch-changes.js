const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://wavechat:cEUFh98XT8jnz72@cluster0.icmtcjp.mongodb.net/wave-chat?retryWrites=true&w=majority&appName=Cluster0';

async function watch() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wave-chat');
    
    console.log('Starting Change Stream watcher for waveCache collection...');
    console.log('This will show every change to the database in real-time.\n');
    
    const changeStream = db.collection('waveCache').watch();
    
    changeStream.on('change', (change) => {
        const now = new Date().toISOString();
        console.log(`\n[${now}] CHANGE DETECTED:`);
        console.log('Operation:', change.operationType);
        if (change.updateDescription) {
            console.log('Updated fields:', JSON.stringify(change.updateDescription.updatedFields, null, 2));
        }
        if (change.fullDocument) {
            console.log('Full document:', JSON.stringify(change.fullDocument, null, 2));
        }
    });
    
    console.log('Watching... Press Ctrl+C to stop.\n');
}

watch().catch(console.error);
