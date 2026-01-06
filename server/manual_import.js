const axios = require('axios');

async function run() {
    try {
        console.log("Fetching 70 candidates from Preview...");
        const previewRes = await axios.post('http://localhost:4000/extraction/preview', {
            params: {
                codigo_atividade_principal: ["4110700"],
                com_email: true,
                com_telefone: true,
                excluir_email_contab: true
            },
            limit: 70
        });

        const candidates = previewRes.data.candidates;
        console.log(`Found ${candidates.length} candidates.`);

        if (candidates.length === 0) {
            console.log("No candidates found. Exiting.");
            return;
        }

        // Add owner: 'joao'
        const leadsToSave = candidates.map(c => ({
            ...c,
            owner: 'joao'
        }));

        console.log("Saving batch...");
        const saveRes = await axios.post('http://localhost:4000/leads/batch', leadsToSave);
        console.log("Save Result:", saveRes.data);

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

run();
