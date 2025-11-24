const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'wave-chat';

async function updateUser() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const collection = db.collection('chatData');

        // Get current data
        const currentData = await collection.findOne({ _id: 'chatState' });
        
        if (!currentData) {
            console.error('❌ No chat data found in database');
            return;
        }

        console.log('📦 Current registered users:', currentData.registeredUsers?.length || 0);

        // Find user "Hiddeb"
        const userIndex = currentData.registeredUsers?.findIndex(
            ([userId, user]) => user.nickname === 'Hiddeb'
        );

        if (userIndex === -1 || userIndex === undefined) {
            console.error('❌ User "Hiddeb" not found in database');
            console.log('Available users:', currentData.registeredUsers?.map(([id, u]) => u.nickname).join(', '));
            return;
        }

        const [userId, userData] = currentData.registeredUsers[userIndex];
        console.log('✅ Found user "Hiddeb" with ID:', userId);
        console.log('Current data:', userData);

        // Update user data
        const updatedUser = {
            ...userData,
            nickname: 'hidden',
            isAdmin: true,
            avatarHue: null, // Will use custom avatar
            customAvatar: 'hidden.png'
        };

        currentData.registeredUsers[userIndex] = [userId, updatedUser];

        // Update in database
        const result = await collection.updateOne(
            { _id: 'chatState' },
            { $set: { registeredUsers: currentData.registeredUsers } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ User updated successfully!');
            console.log('New nickname: hidden');
            console.log('Admin status: true');
            console.log('Custom avatar: hidden.png');
        } else {
            console.log('⚠️  No changes made to database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

updateUser();
