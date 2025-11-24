const https = require('https');

const data = JSON.stringify({
    oldNickname: 'Hiddeb',
    newNickname: 'hidden',
    makeAdmin: true,
    customAvatar: 'hidden.png',
    adminKey: 'wave-admin-key-2025'
});

const options = {
    hostname: 'wave-downtime-tracker.onrender.com',
    port: 443,
    path: '/api/admin/update-user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    
    console.log(`Status Code: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', responseData);
        try {
            const parsed = JSON.parse(responseData);
            if (parsed.success) {
                console.log('\n✅ User updated successfully!');
                console.log('New nickname:', parsed.user.nickname);
                console.log('Admin status:', parsed.user.isAdmin);
                console.log('Custom avatar:', parsed.user.customAvatar);
            } else {
                console.log('\n❌ Update failed:', parsed.error);
            }
        } catch (e) {
            console.log('Raw response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
