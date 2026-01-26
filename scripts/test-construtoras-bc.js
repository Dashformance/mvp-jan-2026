const axios = require('axios');

async function testExtractionV5() {
    const apiKey = "28af65e3e9adce4a1f869c3c31d14dab36d3f4b3ba79aaf6035f3a511a8b91529d4dcb5c98f20494c90e823e4184ac51a5ce8993349e76c66bb8222e5dfeede8";

    // Using v5 endpoint as per documentation
    const payload = {
        codigo_atividade_principal: ["4120400"], // Construção de edifícios
        situacao_cadastral: ["ATIVA"],
        uf: ["SC"],
        municipio: ["balneario camboriu"],
        com_email: false,
        com_telefone: true,
        limite: 20,
        pagina: 1
    };

    console.log("📡 Buscando construtoras em Balneário Camboriú (API v5)...\n");

    try {
        const response = await axios.post('https://api.casadosdados.com.br/v5/cnpj/pesquisa', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log("\n✅ Resposta recebida!");
        console.log("Total encontrado:", response.data.total);

        const leads = response.data.cnpjs || [];
        console.log("Leads nesta página:", leads.length);

        if (leads.length > 0) {
            console.log("\n📋 Primeiras 10 empresas:\n");
            leads.slice(0, 10).forEach((lead, i) => {
                console.log(`${i + 1}. ${lead.razao_social}`);
                console.log(`   CNPJ: ${lead.cnpj}`);
                console.log(`   Fantasia: ${lead.nome_fantasia || '-'}`);
                console.log("");
            });
        } else {
            console.log("\n⚠️ Nenhum lead retornado. Resposta:");
            console.log(JSON.stringify(response.data, null, 2).substring(0, 2000));
        }

    } catch (error) {
        console.log("❌ Erro:", error.response?.status, error.response?.data || error.message);
    }
}

testExtractionV5();
