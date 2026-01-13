const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/leads/stats/timeline?days=7');
        const data = await res.json();
        console.log('--- TIMELINE API DATA ---');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('API Test Failed (might not be running)', e.message);
    }
}

test();
