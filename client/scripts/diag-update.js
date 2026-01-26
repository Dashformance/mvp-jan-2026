const fetch = require('node-fetch');

async function testUpdate() {
    const leadId = 'e773ae03-7645-4a49-8fbd-79416914a127';
    const url = `http://localhost:3000/api/leads/${leadId}`;

    console.log(`Testing PATCH ${url}`);

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_name: 'Helbor Empreendimentos TEST' })
        });

        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);

        try {
            const json = JSON.parse(text);
            console.log('JSON parsed successfully');
        } catch (e) {
            console.log('Response is NOT JSON');
            if (text.includes('<!DOCTYPE html>')) {
                console.log('Detected HTML error page');
            }
        }
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testUpdate();
