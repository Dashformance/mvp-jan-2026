const axios = require('axios');

async function debugFields() {
    const apiKey = "28af65e3e9adce4a1f869c3c31d14dab36d3f4b3ba79aaf6035f3a511a8b91529d4dcb5c98f20494c90e823e4184ac51a5ce8993349e76c66bb8222e5dfeede8";

    const payload = {
        query: {
            termo: [],
            atividade_principal: [],
            natureza_juridica: [],
            uf: ["SP"],
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
                'Content-Type': 'application/json'
            }
        });

        const list = response.data.cnpjs || response.data.leads || [];
        if (list.length > 0) {
            const item = list[0];
            console.log("KEYS FOUND:", Object.keys(item));
            console.log("FULL ITEM:", JSON.stringify(item, null, 2));
        } else {
            console.log("No items found");
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

debugFields();
