const axios = require('axios');

// Basic payload based on standard reverse-engineered usage of Casa dos Dados v5 or similar APIs
// Adjusting based on user provided constraints
async function testApi(apiKey) {
    console.log("Testing connection with key: " + apiKey.slice(0, 5) + "...");

    const payload = {
        query: {
            termo: [],
            atividade_principal: [], // We can search for "Software" CNAE example: 6201-5-01
            natureza_juridica: [],
            uf: ["SP"], // Limit to SP for test
            municipio: [],
            bairro: [],
            situacao_cadastral: "ATIVA",
            cep: [],
            ddd: []
        },
        range_query: {
            data_abertura: { lte: null, gte: null },
            capital_social: { lte: null, gte: null }
        },
        extras: {
            somente_matriz: false,
            somente_filial: false,
            com_email: true,
            com_telefone: true,
            somente_mei: false,
            excluir_mei: false,
            com_contato_telefonico: false,
            somente_fixo: false,
            somente_celular: false,
            somente_matriz_e_filial: false,
            excluir_email_contab: true
        },
        page: 1
    };

    try {
        const response = await axios.post('https://api.casadosdados.com.br/v5/cnpj/pesquisa', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        console.log("---------------------------------------------------");
        console.log(`✅ Success! Status Code: ${response.status}`);
        console.log("Response Keys:", Object.keys(response.data));
        console.log("Response Data Preview:", JSON.stringify(response.data).slice(0, 200));
        console.log("---------------------------------------------------");

        // Check if structure matches expectation or is wrapped
        const leads = response.data.cnpjs || [];
        const count = response.data.total || leads.length;

        console.log(`📊 Total Companies Found (Count): ${count}`);
        console.log("---------------------------------------------------");

        if (leads && leads.length > 0) {
            const lead = leads[0];
            console.log("🔎 First Lead Preview:");
            console.log(`   Name: ${lead.razao_social}`);
            console.log(`   Trade Name: ${lead.nome_fantasia}`);
            console.log(`   CNPJ: ${lead.cnpj}`);
            console.log(`   Date Open: ${lead.data_abertura}`);
            console.log("---------------------------------------------------");
        } else {
            console.log("⚠️ No leads returned in the list (but request succeeded).");
        }

    } catch (error) {
        console.log("---------------------------------------------------");
        console.log("❌ Request Failed");
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.log(`   Error: ${error.message}`);
        }
        console.log("---------------------------------------------------");
    }
}

const key = process.argv[2];
if (!key) {
    console.log("Usage: node test-api.js <YOUR_API_KEY>");
} else {
    testApi(key);
}
