// Script to fix robloxUpdateCombo value
// Run: node fix-combo.js YOUR_ADMIN_KEY

const ADMIN_KEY = process.argv[2];

if (!ADMIN_KEY) {
    console.log('Usage: node fix-combo.js YOUR_ADMIN_KEY');
    console.log('Example: node fix-combo.js abc123secret');
    process.exit(1);
}

async function fixCombo() {
    try {
        const response = await fetch('https://wave-chat-server.onrender.com/api/admin/override-timer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminKey: ADMIN_KEY,
                robloxUpdateCombo: 4
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Success! Combo updated to 4');
            console.log('Response:', data);
        } else {
            console.log('❌ Error:', data);
        }
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

fixCombo();
