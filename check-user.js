const https = require('https');

const options = {
    hostname: 'wave-chat-server.onrender.com',
    port: 443,
    path: '/api/admin/update-user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const data = JSON.stringify({
    oldNickname: 'Hidden',
    newNickname: 'Hidden',
    adminKey: 'wave-admin-key-2025'
});

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
        try {
            const parsed = JSON.parse(responseData);
            if (parsed.user) {
                console.log('\n✅ Current user data:');
                console.log('Nickname:', parsed.user.nickname);
                console.log('Admin status:', parsed.user.isAdmin);
                console.log('Custom avatar:', parsed.user.customAvatar);
                console.log('User ID:', parsed.user.id);
            }
        } catch (e) {
            console.error('Failed to parse response');
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
