---
title: Default module
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Default module

Base URLs:

# Authentication

* API Key (api_key)
    - Parameter Name: **api-key**, in: header. 

# API/v4

## GET Consulta CNPJ

GET /v4/cnpj/{cnpj}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|cnpj|path|string| yes |none|

> Response Examples

> 200 Response

```json
{
  "cnpj": "33000167004794",
  "cnpj_raiz": "33000167",
  "filial_numero": 1,
  "razao_social": "PETROLEO BRASILEIRO S A PETROBRAS",
  "qualificacao_responsavel": {
    "codigo": "string",
    "descricao": "string"
  },
  "porte_empresa": {
    "codigo": "string",
    "descricao": "string"
  },
  "matriz_filial": "MATRIZ",
  "codigo_natureza_juridica": "string",
  "descricao_natureza_juridica": "string",
  "nome_fantasia": "string",
  "situacao_cadastral": {
    "situacao_cadastral": "string",
    "motivo": "string",
    "data": "2019-08-24"
  },
  "endereco": {
    "cep": "string",
    "tipo_logradouro": "string",
    "logradouro": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "uf": "string",
    "municipio": "string",
    "ibge": {
      "codigo_municipio": 0,
      "codigo_uf": 0,
      "latitude": 0,
      "longitude": 0
    }
  },
  "data_abertura": "2019-08-24",
  "capital_social": 0,
  "situacao_especial": {
    "descricao": "string",
    "data": "2019-08-24"
  },
  "quadro_societario": [
    {
      "nome": "string",
      "qualificacao_socio": "string",
      "qualificacao_socio_codigo": 0,
      "identificador_socio": "string",
      "documento": "string",
      "data_entrada_sociedade": "2019-08-24",
      "pais_socio": "string",
      "cpf_representante_legal": "string",
      "nome_representante_legal": "string",
      "qualificacao_representante_legal": "string",
      "faixa_etaria_codigo": 0,
      "faixa_etaria_descricao": "string"
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|retorno com sucesso|[CNPJPesquisaResposta](#schemacnpjpesquisaresposta)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Solicitação inválida, verifique se o tipo de dado no campo está correto|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Api key inválida|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Sem saldo para a operação|None|

## GET Quantidade de empresas abertas do dia

GET /v4/dashboard/cnpj/empresas-abertas/hoje

> Response Examples

> 200 Response

```json
{
  "total": 0
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|retorno com sucesso|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token inválido|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» total|integer|false|none||none|

## GET Quantidade de empresas abertas nos últimos X dias

GET /v4/dashboard/cnpj/empresas-abertas/{quantidadeDias}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|quantidadeDias|path|string| yes |none|

> Response Examples

> 200 Response

```json
[
  {
    "data": "2019-08-24",
    "total": 0
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|retorno com sucesso|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Solicitação inválida, verifique o valor do parametro|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Token inválido|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» data|string(date)|false|none||none|
|» total|integer|false|none||none|

## GET Consulta geração de arquivo

GET /v4/public/cnpj/pesquisa/arquivo/{arquivoUUID}

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|arquivoUUID|path|string| yes |none|
|corpo|query|boolean| no |none|

> Response Examples

> 200 Response

```json
{
  "link": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Atenção, o link para download fica ativo por 1 hora, após o período é necessário gerar outro link, pode ser gerado varios links.|Inline|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|Solicitação em processamento, tente novamente em segundos|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Houve algum problema com a solicitação|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|Arquivo não encontrado|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» link|string|false|none||none|

## GET Listar solicitações de arquivos

GET /v4/cnpj/pesquisa/arquivo

Lista as solicitações de geração de arquivo

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|pagina|query|integer| no |none|

> Response Examples

> 200 Response

```json
[
  {
    "arquivo_uuid": "032e227f-5f81-4bfc-98f4-b5cd4c02fb8e",
    "nome": "string",
    "tipo": "string",
    "enviar_para": [
      "string"
    ],
    "status": "aguardando_processamento",
    "pesquisa": {
      "cnpj": [
        "29806217000175",
        "33000167000292"
      ],
      "busca_textual": [
        {
          "texto": [
            "string"
          ],
          "tipo_busca": "exata",
          "razao_social": true,
          "nome_fantasia": true,
          "nome_socio": true
        }
      ],
      "codigo_atividade_principal": [
        "7112000",
        "9602501",
        "6462000"
      ],
      "incluir_atividade_secundaria": true,
      "codigo_atividade_secundaria": [
        "7112000",
        "9602501",
        "6462000"
      ],
      "codigo_natureza_juridica": [
        "7112000",
        "9602501",
        "6462000"
      ],
      "situacao_cadastral": [
        "ATIVA"
      ],
      "matriz_filial": "MATRIZ",
      "cnpj_raiz": [
        "33000167",
        "29806217"
      ],
      "cep": [
        "07115000",
        "01310930"
      ],
      "endereco_numero": [
        "21",
        "109B"
      ],
      "uf": [
        "sp",
        "rj",
        "mg"
      ],
      "municipio": [
        "sao paulo",
        "guarulhos",
        "belo horizonte"
      ],
      "bairro": [
        "centro",
        "vila mariana"
      ],
      "ddd": [
        "11",
        "12",
        "31"
      ],
      "telefone": [
        "5135277255"
      ],
      "data_abertura": {
        "inicio": "2019-08-24",
        "fim": "2019-08-24",
        "ultimos_dias": 0
      },
      "capital_social": {
        "minimo": 0,
        "maximo": 0
      },
      "mei": {
        "optante": true,
        "excluir_optante": true,
        "data_exclusao": {
          "inicio": "2019-08-24",
          "fim": "2019-08-24"
        }
      },
      "simples": {
        "optante": true,
        "excluir_optante": true,
        "data_exclusao": {
          "inicio": "2019-08-24",
          "fim": "2019-08-24"
        }
      },
      "mais_filtros": {
        "somente_matriz": true,
        "somente_filial": true,
        "com_email": true,
        "com_telefone": true,
        "somente_fixo": true,
        "somente_celular": true,
        "excluir_empresas_visualizadas": true,
        "excluir_email_contab": true
      },
      "excluir": {
        "cnpj": [
          "29806217000175",
          "33000167000292"
        ]
      },
      "limite": 10,
      "pagina": 1
    },
    "quantidade": 0,
    "quantidade_solicitada": 0,
    "criado": "2019-08-24T14:15:22Z",
    "atualizado": "2019-08-24T14:15:22Z"
  }
]
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Lista dos arquivos|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Solicitação inválida, verifique os parametro|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Problemas no servidor|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» arquivo_uuid|string(uuid)|false|none||none|
|» nome|string|false|none||none|
|» tipo|string|false|none||none|
|» enviar_para|[string]|false|none||none|
|» status|string|false|none||none|
|» pesquisa|[CNPJPesquisaSolicitacao](#schemacnpjpesquisasolicitacao)|false|none||none|
|»» cnpj|[string]|false|none||none|
|»» busca_textual|[object]|false|none||none|
|»»» texto|[string]|false|none||none|
|»»» tipo_busca|string|false|none||none|
|»»» razao_social|boolean|false|none||none|
|»»» nome_fantasia|boolean|false|none||none|
|»»» nome_socio|boolean|false|none||none|
|»» codigo_atividade_principal|[string]|false|none||none|
|»» incluir_atividade_secundaria|boolean|false|none||none|
|»» codigo_atividade_secundaria|[string]|false|none||none|
|»» codigo_natureza_juridica|[string]|false|none||none|
|»» situacao_cadastral|[string]|false|none||none|
|»» matriz_filial|[MatrizFilial](#schemamatrizfilial)|false|none||none|
|»» cnpj_raiz|[string]|false|none||none|
|»» cep|[string]|false|none||none|
|»» endereco_numero|[string]|false|none||none|
|»» uf|[string]|false|none||none|
|»» municipio|[string]|false|none||none|
|»» bairro|[string]|false|none||none|
|»» ddd|[string]|false|none||none|
|»» telefone|[string]|false|none||none|
|»» data_abertura|object|false|none||none|
|»»» inicio|string(date)|false|none||none|
|»»» fim|string(date)|false|none||none|
|»»» ultimos_dias|integer|false|none||none|
|»» capital_social|object|false|none||none|
|»»» minimo|integer|false|none||none|
|»»» maximo|integer|false|none||none|
|»» mei|object|false|none||none|
|»»» optante|boolean|false|none||none|
|»»» excluir_optante|boolean|false|none||none|
|»»» data_exclusao|object|false|none||none|
|»»»» inicio|string(date)|false|none||none|
|»»»» fim|string(date)|false|none||none|
|»» simples|object|false|none||none|
|»»» optante|boolean|false|none||none|
|»»» excluir_optante|boolean|false|none||none|
|»»» data_exclusao|object|false|none||none|
|»»»» inicio|string(date)|false|none||none|
|»»»» fim|string(date)|false|none||none|
|»» mais_filtros|object|false|none||none|
|»»» somente_matriz|boolean|false|none||none|
|»»» somente_filial|boolean|false|none||none|
|»»» com_email|boolean|false|none||none|
|»»» com_telefone|boolean|false|none||none|
|»»» somente_fixo|boolean|false|none||none|
|»»» somente_celular|boolean|false|none||none|
|»»» excluir_empresas_visualizadas|boolean|false|none||none|
|»»» excluir_email_contab|boolean|false|none||none|
|»» excluir|object|false|none||none|
|»»» cnpj|[string]|false|none||none|
|»» limite|integer|false|none||none|
|»» pagina|integer|false|none||none|
|» quantidade|number|false|none||none|
|» quantidade_solicitada|integer|false|none||none|
|» criado|string(date-time)|false|none||none|
|» atualizado|string(date-time)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|status|aguardando_processamento|
|status|processando|
|status|processado|
|tipo_busca|exata|
|tipo_busca|radical|
|matriz_filial|MATRIZ|
|matriz_filial|FILIAL|

# API/v5

## POST Pesquisa Avançada de empresas

POST /v5/cnpj/pesquisa

> Body Parameters

```json
{
  "cnpj": [
    "29806217000175",
    "33000167000292"
  ],
  "busca_textual": [
    {
      "texto": [
        "string"
      ],
      "tipo_busca": "exata",
      "razao_social": true,
      "nome_fantasia": true,
      "nome_socio": true
    }
  ],
  "codigo_atividade_principal": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "incluir_atividade_secundaria": true,
  "codigo_atividade_secundaria": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "codigo_natureza_juridica": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "situacao_cadastral": [
    "ATIVA"
  ],
  "matriz_filial": "MATRIZ",
  "cnpj_raiz": [
    "33000167",
    "29806217"
  ],
  "cep": [
    "07115000",
    "01310930"
  ],
  "endereco_numero": [
    "21",
    "109B"
  ],
  "uf": [
    "sp",
    "rj",
    "mg"
  ],
  "municipio": [
    "sao paulo",
    "guarulhos",
    "belo horizonte"
  ],
  "bairro": [
    "centro",
    "vila mariana"
  ],
  "ddd": [
    "11",
    "12",
    "31"
  ],
  "telefone": [
    "5135277255"
  ],
  "data_abertura": {
    "inicio": "2019-08-24",
    "fim": "2019-08-24",
    "ultimos_dias": 0
  },
  "capital_social": {
    "minimo": 0,
    "maximo": 0
  },
  "mei": {
    "optante": true,
    "excluir_optante": true,
    "data_exclusao": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24"
    }
  },
  "simples": {
    "optante": true,
    "excluir_optante": true,
    "data_exclusao": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24"
    }
  },
  "mais_filtros": {
    "somente_matriz": true,
    "somente_filial": true,
    "com_email": true,
    "com_telefone": true,
    "somente_fixo": true,
    "somente_celular": true,
    "excluir_empresas_visualizadas": true,
    "excluir_email_contab": true
  },
  "excluir": {
    "cnpj": [
      "29806217000175",
      "33000167000292"
    ]
  },
  "limite": 10,
  "pagina": 1
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|tipo_resultado|query|string| no |Informa se a resposta da requisição é simples ou completa, a simples contem cnpj, razão social, nome fantasia e situação cadastral e a completa todos os campos disponiveis. O Padrão é simples|
|body|body|[CNPJPesquisaSolicitacao](#schemacnpjpesquisasolicitacao)| no |none|

#### Enum

|Name|Value|
|---|---|
|tipo_resultado|simples|
|tipo_resultado|completo|

> Response Examples

> 200 Response

```json
{
  "total": 0,
  "cnpjs": [
    {
      "cnpj": "33000167004794",
      "cnpj_raiz": "33000167",
      "filial_numero": 1,
      "razao_social": "PETROLEO BRASILEIRO S A PETROBRAS",
      "qualificacao_responsavel": {
        "codigo": "string",
        "descricao": "string"
      },
      "porte_empresa": {
        "codigo": "string",
        "descricao": "string"
      },
      "matriz_filial": "MATRIZ",
      "codigo_natureza_juridica": "string",
      "descricao_natureza_juridica": "string",
      "nome_fantasia": "string",
      "situacao_cadastral": {
        "situacao_cadastral": "string",
        "motivo": "string",
        "data": "2019-08-24"
      },
      "endereco": {
        "cep": "string",
        "tipo_logradouro": "string",
        "logradouro": "string",
        "numero": "string",
        "complemento": "string",
        "bairro": "string",
        "uf": "string",
        "municipio": "string",
        "ibge": {
          "codigo_municipio": 0,
          "codigo_uf": 0,
          "latitude": 0,
          "longitude": 0
        }
      },
      "data_abertura": "2019-08-24",
      "capital_social": 0,
      "situacao_especial": {
        "descricao": "string",
        "data": "2019-08-24"
      },
      "quadro_societario": [
        {
          "nome": "string",
          "qualificacao_socio": "string",
          "qualificacao_socio_codigo": 0,
          "identificador_socio": "string",
          "documento": "string",
          "data_entrada_sociedade": "2019-08-24",
          "pais_socio": "string",
          "cpf_representante_legal": "string",
          "nome_representante_legal": "string",
          "qualificacao_representante_legal": "string",
          "faixa_etaria_codigo": 0,
          "faixa_etaria_descricao": "string"
        }
      ]
    }
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|retorno com sucesso|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Solicitação inválida, verifique se o tipo de dado no campo está correto|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Api key inválida|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Sem saldo para a operação|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» total|integer|false|none||none|
|» cnpjs|[[CNPJPesquisaResposta](#schemacnpjpesquisaresposta)]|false|none||none|
|»» cnpj|string|false|none||none|
|»» cnpj_raiz|string|false|none||none|
|»» filial_numero|integer(int32)|false|none||none|
|»» razao_social|string|false|none||none|
|»» qualificacao_responsavel|[CodigoDescricao](#schemacodigodescricao)|false|none||none|
|»»» codigo|string|false|none||none|
|»»» descricao|string|false|none||none|
|»» porte_empresa|[CodigoDescricao](#schemacodigodescricao)|false|none||none|
|»»» codigo|string|false|none||none|
|»»» descricao|string|false|none||none|
|»» matriz_filial|[MatrizFilial](#schemamatrizfilial)|false|none||none|
|»» codigo_natureza_juridica|string|false|none||none|
|»» descricao_natureza_juridica|string|false|none||none|
|»» nome_fantasia|string|false|none||none|
|»» situacao_cadastral|object|false|none||none|
|»»» situacao_cadastral|string|false|none||none|
|»»» motivo|string|false|none||none|
|»»» data|string(date)|false|none||none|
|»» endereco|object|false|none||none|
|»»» cep|string|false|none||none|
|»»» tipo_logradouro|string|false|none||none|
|»»» logradouro|string|false|none||none|
|»»» numero|string|false|none||none|
|»»» complemento|string|false|none||none|
|»»» bairro|string|false|none||none|
|»»» uf|string|false|none||none|
|»»» municipio|string|false|none||none|
|»»» ibge|object|false|none||none|
|»»»» codigo_municipio|integer|false|none||none|
|»»»» codigo_uf|integer|false|none||none|
|»»»» latitude|number|false|none||none|
|»»»» longitude|number|false|none||none|
|»» data_abertura|string(date)|false|none||none|
|»» capital_social|integer|false|none||none|
|»» situacao_especial|object|false|none||none|
|»»» descricao|string|false|none||none|
|»»» data|string(date)|false|none||none|
|»» quadro_societario|[object]|false|none||none|
|»»» nome|string|false|none||none|
|»»» qualificacao_socio|string|false|none||none|
|»»» qualificacao_socio_codigo|integer|false|none||none|
|»»» identificador_socio|string|false|none||none|
|»»» documento|string|false|none||none|
|»»» data_entrada_sociedade|string(date)|false|none||none|
|»»» pais_socio|string|false|none||none|
|»»» cpf_representante_legal|string|false|none||none|
|»»» nome_representante_legal|string|false|none||none|
|»»» qualificacao_representante_legal|string|false|none||none|
|»»» faixa_etaria_codigo|integer|false|none||none|
|»»» faixa_etaria_descricao|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|matriz_filial|MATRIZ|
|matriz_filial|FILIAL|

## POST Gerar arquivo com as empresas

POST /v5/cnpj/pesquisa/arquivo

> Body Parameters

```json
{
  "total_linhas": 0,
  "nome": "string",
  "tipo": "csv",
  "enviar_para": [
    "user@example.com"
  ],
  "pesquisa": {
    "cnpj": [
      "29806217000175",
      "33000167000292"
    ],
    "busca_textual": [
      {
        "texto": [
          "string"
        ],
        "tipo_busca": "exata",
        "razao_social": true,
        "nome_fantasia": true,
        "nome_socio": true
      }
    ],
    "codigo_atividade_principal": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "incluir_atividade_secundaria": true,
    "codigo_atividade_secundaria": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "codigo_natureza_juridica": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "situacao_cadastral": [
      "ATIVA"
    ],
    "matriz_filial": "MATRIZ",
    "cnpj_raiz": [
      "33000167",
      "29806217"
    ],
    "cep": [
      "07115000",
      "01310930"
    ],
    "endereco_numero": [
      "21",
      "109B"
    ],
    "uf": [
      "sp",
      "rj",
      "mg"
    ],
    "municipio": [
      "sao paulo",
      "guarulhos",
      "belo horizonte"
    ],
    "bairro": [
      "centro",
      "vila mariana"
    ],
    "ddd": [
      "11",
      "12",
      "31"
    ],
    "telefone": [
      "5135277255"
    ],
    "data_abertura": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24",
      "ultimos_dias": 0
    },
    "capital_social": {
      "minimo": 0,
      "maximo": 0
    },
    "mei": {
      "optante": true,
      "excluir_optante": true,
      "data_exclusao": {
        "inicio": "2019-08-24",
        "fim": "2019-08-24"
      }
    },
    "simples": {
      "optante": true,
      "excluir_optante": true,
      "data_exclusao": {
        "inicio": "2019-08-24",
        "fim": "2019-08-24"
      }
    },
    "mais_filtros": {
      "somente_matriz": true,
      "somente_filial": true,
      "com_email": true,
      "com_telefone": true,
      "somente_fixo": true,
      "somente_celular": true,
      "excluir_empresas_visualizadas": true,
      "excluir_email_contab": true
    },
    "excluir": {
      "cnpj": [
        "29806217000175",
        "33000167000292"
      ]
    },
    "limite": 10,
    "pagina": 1
  }
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|[CNPJArquivo](#schemacnpjarquivo)| no |none|

> Response Examples

> 200 Response

```json
{
  "mensagem": "string",
  "arquivo_uuid": "032e227f-5f81-4bfc-98f4-b5cd4c02fb8e"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Id da solicitação retornado com sucesso, use ele para consultar o arquivo gerado|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Solicitação inválida, verifique se o tipo de dado no campo está correto|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Api key inválida|None|
|403|[Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3)|Sem saldo para a operação|None|

### Responses Data Schema

HTTP Status Code **200**

|Name|Type|Required|Restrictions|Title|description|
|---|---|---|---|---|---|
|» mensagem|string|false|none||none|
|» arquivo_uuid|string(uuid)|false|none||none|

## GET Consulta o saldo total e detalhado da conta

GET /v5/saldo

> Response Examples

> 200 Response

```json
{
  "saldos": {
    "property1": {
      "valor": 10000,
      "criado_em": "2025-03-15T23:24:21.317053316-03:00",
      "expira_em": "2027-03-15T23:24:20.948479482-03:00"
    },
    "property2": {
      "valor": 10000,
      "criado_em": "2025-03-15T23:24:21.317053316-03:00",
      "expira_em": "2027-03-15T23:24:20.948479482-03:00"
    }
  },
  "saldo_total": 129291
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Resposta com os saldos.|[SaldoResponse](#schemasaldoresponse)|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Api key inválida|None|

# Data Schema

<h2 id="tocS_CNPJPesquisaResposta">CNPJPesquisaResposta</h2>

<a id="schemacnpjpesquisaresposta"></a>
<a id="schema_CNPJPesquisaResposta"></a>
<a id="tocScnpjpesquisaresposta"></a>
<a id="tocscnpjpesquisaresposta"></a>

```json
{
  "cnpj": "33000167004794",
  "cnpj_raiz": "33000167",
  "filial_numero": 1,
  "razao_social": "PETROLEO BRASILEIRO S A PETROBRAS",
  "qualificacao_responsavel": {
    "codigo": "string",
    "descricao": "string"
  },
  "porte_empresa": {
    "codigo": "string",
    "descricao": "string"
  },
  "matriz_filial": "MATRIZ",
  "codigo_natureza_juridica": "string",
  "descricao_natureza_juridica": "string",
  "nome_fantasia": "string",
  "situacao_cadastral": {
    "situacao_cadastral": "string",
    "motivo": "string",
    "data": "2019-08-24"
  },
  "endereco": {
    "cep": "string",
    "tipo_logradouro": "string",
    "logradouro": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "uf": "string",
    "municipio": "string",
    "ibge": {
      "codigo_municipio": 0,
      "codigo_uf": 0,
      "latitude": 0,
      "longitude": 0
    }
  },
  "data_abertura": "2019-08-24",
  "capital_social": 0,
  "situacao_especial": {
    "descricao": "string",
    "data": "2019-08-24"
  },
  "quadro_societario": [
    {
      "nome": "string",
      "qualificacao_socio": "string",
      "qualificacao_socio_codigo": 0,
      "identificador_socio": "string",
      "documento": "string",
      "data_entrada_sociedade": "2019-08-24",
      "pais_socio": "string",
      "cpf_representante_legal": "string",
      "nome_representante_legal": "string",
      "qualificacao_representante_legal": "string",
      "faixa_etaria_codigo": 0,
      "faixa_etaria_descricao": "string"
    }
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|cnpj|string|false|none||none|
|cnpj_raiz|string|false|none||none|
|filial_numero|integer(int32)|false|none||none|
|razao_social|string|false|none||none|
|qualificacao_responsavel|[CodigoDescricao](#schemacodigodescricao)|false|none||none|
|porte_empresa|[CodigoDescricao](#schemacodigodescricao)|false|none||none|
|matriz_filial|[MatrizFilial](#schemamatrizfilial)|false|none||none|
|codigo_natureza_juridica|string|false|none||none|
|descricao_natureza_juridica|string|false|none||none|
|nome_fantasia|string|false|none||none|
|situacao_cadastral|object|false|none||none|
|» situacao_cadastral|string|false|none||none|
|» motivo|string|false|none||none|
|» data|string(date)|false|none||none|
|endereco|object|false|none||none|
|» cep|string|false|none||none|
|» tipo_logradouro|string|false|none||none|
|» logradouro|string|false|none||none|
|» numero|string|false|none||none|
|» complemento|string|false|none||none|
|» bairro|string|false|none||none|
|» uf|string|false|none||none|
|» municipio|string|false|none||none|
|» ibge|object|false|none||none|
|»» codigo_municipio|integer|false|none||none|
|»» codigo_uf|integer|false|none||none|
|»» latitude|number|false|none||none|
|»» longitude|number|false|none||none|
|data_abertura|string(date)|false|none||none|
|capital_social|integer|false|none||none|
|situacao_especial|object|false|none||none|
|» descricao|string|false|none||none|
|» data|string(date)|false|none||none|
|quadro_societario|[object]|false|none||none|
|» nome|string|false|none||none|
|» qualificacao_socio|string|false|none||none|
|» qualificacao_socio_codigo|integer|false|none||none|
|» identificador_socio|string|false|none||none|
|» documento|string|false|none||none|
|» data_entrada_sociedade|string(date)|false|none||none|
|» pais_socio|string|false|none||none|
|» cpf_representante_legal|string|false|none||none|
|» nome_representante_legal|string|false|none||none|
|» qualificacao_representante_legal|string|false|none||none|
|» faixa_etaria_codigo|integer|false|none||none|
|» faixa_etaria_descricao|string|false|none||none|

<h2 id="tocS_CodigoDescricao">CodigoDescricao</h2>

<a id="schemacodigodescricao"></a>
<a id="schema_CodigoDescricao"></a>
<a id="tocScodigodescricao"></a>
<a id="tocscodigodescricao"></a>

```json
{
  "codigo": "string",
  "descricao": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|codigo|string|false|none||none|
|descricao|string|false|none||none|

<h2 id="tocS_CNPJPesquisaSolicitacao">CNPJPesquisaSolicitacao</h2>

<a id="schemacnpjpesquisasolicitacao"></a>
<a id="schema_CNPJPesquisaSolicitacao"></a>
<a id="tocScnpjpesquisasolicitacao"></a>
<a id="tocscnpjpesquisasolicitacao"></a>

```json
{
  "cnpj": [
    "29806217000175",
    "33000167000292"
  ],
  "busca_textual": [
    {
      "texto": [
        "string"
      ],
      "tipo_busca": "exata",
      "razao_social": true,
      "nome_fantasia": true,
      "nome_socio": true
    }
  ],
  "codigo_atividade_principal": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "incluir_atividade_secundaria": true,
  "codigo_atividade_secundaria": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "codigo_natureza_juridica": [
    "7112000",
    "9602501",
    "6462000"
  ],
  "situacao_cadastral": [
    "ATIVA"
  ],
  "matriz_filial": "MATRIZ",
  "cnpj_raiz": [
    "33000167",
    "29806217"
  ],
  "cep": [
    "07115000",
    "01310930"
  ],
  "endereco_numero": [
    "21",
    "109B"
  ],
  "uf": [
    "sp",
    "rj",
    "mg"
  ],
  "municipio": [
    "sao paulo",
    "guarulhos",
    "belo horizonte"
  ],
  "bairro": [
    "centro",
    "vila mariana"
  ],
  "ddd": [
    "11",
    "12",
    "31"
  ],
  "telefone": [
    "5135277255"
  ],
  "data_abertura": {
    "inicio": "2019-08-24",
    "fim": "2019-08-24",
    "ultimos_dias": 0
  },
  "capital_social": {
    "minimo": 0,
    "maximo": 0
  },
  "mei": {
    "optante": true,
    "excluir_optante": true,
    "data_exclusao": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24"
    }
  },
  "simples": {
    "optante": true,
    "excluir_optante": true,
    "data_exclusao": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24"
    }
  },
  "mais_filtros": {
    "somente_matriz": true,
    "somente_filial": true,
    "com_email": true,
    "com_telefone": true,
    "somente_fixo": true,
    "somente_celular": true,
    "excluir_empresas_visualizadas": true,
    "excluir_email_contab": true
  },
  "excluir": {
    "cnpj": [
      "29806217000175",
      "33000167000292"
    ]
  },
  "limite": 10,
  "pagina": 1
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|cnpj|[string]|false|none||none|
|busca_textual|[object]|false|none||none|
|» texto|[string]|false|none||none|
|» tipo_busca|string|false|none||none|
|» razao_social|boolean|false|none||none|
|» nome_fantasia|boolean|false|none||none|
|» nome_socio|boolean|false|none||none|
|codigo_atividade_principal|[string]|false|none||none|
|incluir_atividade_secundaria|boolean|false|none||none|
|codigo_atividade_secundaria|[string]|false|none||none|
|codigo_natureza_juridica|[string]|false|none||none|
|situacao_cadastral|[SituacaoCadastral](#schemasituacaocadastral)|false|none||none|
|matriz_filial|[MatrizFilial](#schemamatrizfilial)|false|none||none|
|cnpj_raiz|[string]|false|none||none|
|cep|[string]|false|none||none|
|endereco_numero|[string]|false|none||none|
|uf|[string]|false|none||none|
|municipio|[string]|false|none||none|
|bairro|[string]|false|none||none|
|ddd|[string]|false|none||none|
|telefone|[string]|false|none||none|
|data_abertura|object|false|none||none|
|» inicio|string(date)|false|none||none|
|» fim|string(date)|false|none||none|
|» ultimos_dias|integer|false|none||none|
|capital_social|object|false|none||none|
|» minimo|integer|false|none||none|
|» maximo|integer|false|none||none|
|mei|object|false|none||none|
|» optante|boolean|false|none||none|
|» excluir_optante|boolean|false|none||none|
|» data_exclusao|object|false|none||none|
|»» inicio|string(date)|false|none||none|
|»» fim|string(date)|false|none||none|
|simples|object|false|none||none|
|» optante|boolean|false|none||none|
|» excluir_optante|boolean|false|none||none|
|» data_exclusao|object|false|none||none|
|»» inicio|string(date)|false|none||none|
|»» fim|string(date)|false|none||none|
|mais_filtros|object|false|none||none|
|» somente_matriz|boolean|false|none||none|
|» somente_filial|boolean|false|none||none|
|» com_email|boolean|false|none||none|
|» com_telefone|boolean|false|none||none|
|» somente_fixo|boolean|false|none||none|
|» somente_celular|boolean|false|none||none|
|» excluir_empresas_visualizadas|boolean|false|none||none|
|» excluir_email_contab|boolean|false|none||none|
|excluir|object|false|none||none|
|» cnpj|[string]|false|none||none|
|limite|integer|false|none||none|
|pagina|integer|false|none||none|

#### Enum

|Name|Value|
|---|---|
|tipo_busca|exata|
|tipo_busca|radical|

<h2 id="tocS_SituacaoCadastral">SituacaoCadastral</h2>

<a id="schemasituacaocadastral"></a>
<a id="schema_SituacaoCadastral"></a>
<a id="tocSsituacaocadastral"></a>
<a id="tocssituacaocadastral"></a>

```json
[
  "ATIVA"
]

```

### Attribute

*None*

<h2 id="tocS_MatrizFilial">MatrizFilial</h2>

<a id="schemamatrizfilial"></a>
<a id="schema_MatrizFilial"></a>
<a id="tocSmatrizfilial"></a>
<a id="tocsmatrizfilial"></a>

```json
"MATRIZ"

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|*anonymous*|string|false|none||none|

#### Enum

|Name|Value|
|---|---|
|*anonymous*|MATRIZ|
|*anonymous*|FILIAL|

<h2 id="tocS_CNPJArquivo">CNPJArquivo</h2>

<a id="schemacnpjarquivo"></a>
<a id="schema_CNPJArquivo"></a>
<a id="tocScnpjarquivo"></a>
<a id="tocscnpjarquivo"></a>

```json
{
  "total_linhas": 0,
  "nome": "string",
  "tipo": "csv",
  "enviar_para": [
    "user@example.com"
  ],
  "pesquisa": {
    "cnpj": [
      "29806217000175",
      "33000167000292"
    ],
    "busca_textual": [
      {
        "texto": [
          "string"
        ],
        "tipo_busca": "exata",
        "razao_social": true,
        "nome_fantasia": true,
        "nome_socio": true
      }
    ],
    "codigo_atividade_principal": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "incluir_atividade_secundaria": true,
    "codigo_atividade_secundaria": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "codigo_natureza_juridica": [
      "7112000",
      "9602501",
      "6462000"
    ],
    "situacao_cadastral": [
      "ATIVA"
    ],
    "matriz_filial": "MATRIZ",
    "cnpj_raiz": [
      "33000167",
      "29806217"
    ],
    "cep": [
      "07115000",
      "01310930"
    ],
    "endereco_numero": [
      "21",
      "109B"
    ],
    "uf": [
      "sp",
      "rj",
      "mg"
    ],
    "municipio": [
      "sao paulo",
      "guarulhos",
      "belo horizonte"
    ],
    "bairro": [
      "centro",
      "vila mariana"
    ],
    "ddd": [
      "11",
      "12",
      "31"
    ],
    "telefone": [
      "5135277255"
    ],
    "data_abertura": {
      "inicio": "2019-08-24",
      "fim": "2019-08-24",
      "ultimos_dias": 0
    },
    "capital_social": {
      "minimo": 0,
      "maximo": 0
    },
    "mei": {
      "optante": true,
      "excluir_optante": true,
      "data_exclusao": {
        "inicio": "2019-08-24",
        "fim": "2019-08-24"
      }
    },
    "simples": {
      "optante": true,
      "excluir_optante": true,
      "data_exclusao": {
        "inicio": "2019-08-24",
        "fim": "2019-08-24"
      }
    },
    "mais_filtros": {
      "somente_matriz": true,
      "somente_filial": true,
      "com_email": true,
      "com_telefone": true,
      "somente_fixo": true,
      "somente_celular": true,
      "excluir_empresas_visualizadas": true,
      "excluir_email_contab": true
    },
    "excluir": {
      "cnpj": [
        "29806217000175",
        "33000167000292"
      ]
    },
    "limite": 10,
    "pagina": 1
  }
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|total_linhas|integer|false|none||Quantas linhas da pesquisa deve ser exportadas, use caso não queira exportar todos os resultados. O padrão é zero para exportar todo o resultado.|
|nome|string|false|none||Nome do arquivo|
|tipo|string|false|none||tipo de arquivo a ser exportado, no momento temos apenas o csv|
|enviar_para|[string]|false|none||none|
|pesquisa|[CNPJPesquisaSolicitacao](#schemacnpjpesquisasolicitacao)|false|none||none|

#### Enum

|Name|Value|
|---|---|
|tipo|csv|

<h2 id="tocS_SaldoDetalhe">SaldoDetalhe</h2>

<a id="schemasaldodetalhe"></a>
<a id="schema_SaldoDetalhe"></a>
<a id="tocSsaldodetalhe"></a>
<a id="tocssaldodetalhe"></a>

```json
{
  "valor": 10000,
  "criado_em": "2025-03-15T23:24:21.317053316-03:00",
  "expira_em": "2027-03-15T23:24:20.948479482-03:00"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|valor|integer|true|none||Valor do saldo.|
|criado_em|string(date-time)|true|none||Data de criação do saldo.|
|expira_em|string(date-time)|true|none||Data de expiração do saldo.|

<h2 id="tocS_Saldos">Saldos</h2>

<a id="schemasaldos"></a>
<a id="schema_Saldos"></a>
<a id="tocSsaldos"></a>
<a id="tocssaldos"></a>

```json
{
  "property1": {
    "valor": 10000,
    "criado_em": "2025-03-15T23:24:21.317053316-03:00",
    "expira_em": "2027-03-15T23:24:20.948479482-03:00"
  },
  "property2": {
    "valor": 10000,
    "criado_em": "2025-03-15T23:24:21.317053316-03:00",
    "expira_em": "2027-03-15T23:24:20.948479482-03:00"
  }
}

```

Mapeamento dos saldos por tipo (avulso ou assinatura).

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|**additionalProperties**|[SaldoDetalhe](#schemasaldodetalhe)|false|none||none|

<h2 id="tocS_SaldoResponse">SaldoResponse</h2>

<a id="schemasaldoresponse"></a>
<a id="schema_SaldoResponse"></a>
<a id="tocSsaldoresponse"></a>
<a id="tocssaldoresponse"></a>

```json
{
  "saldos": {
    "property1": {
      "valor": 10000,
      "criado_em": "2025-03-15T23:24:21.317053316-03:00",
      "expira_em": "2027-03-15T23:24:20.948479482-03:00"
    },
    "property2": {
      "valor": 10000,
      "criado_em": "2025-03-15T23:24:21.317053316-03:00",
      "expira_em": "2027-03-15T23:24:20.948479482-03:00"
    }
  },
  "saldo_total": 129291
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|saldos|[Saldos](#schemasaldos)|true|none||Mapeamento dos saldos por tipo (avulso ou assinatura).|
|saldo_total|integer|true|none||Soma total de todos os saldos.|

