const axios = require('axios');

async function debugDetails() {
    const apiKey = "28af65e3e9adce4a1f869c3c31d14dab36d3f4b3ba79aaf6035f3a511a8b91529d4dcb5c98f20494c90e823e4184ac51a5ce8993349e76c66bb8222e5dfeede8";
    const cnpj = "99017782000139";
    // Trying v4 as per doc, but also will try v5 if v4 fails or lacks data
    const url = `https://api.casadosdados.com.br/v4/cnpj/${cnpj}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log("DETAILS V4 KEYS:", Object.keys(response.data));
        console.log("EMAILS:", response.data.email);
        console.log("PHONES:", response.data.telefones); // detecting likely names
        console.log("FULL:", JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log("Error:", error.message);
    }
}

debugDetails();
