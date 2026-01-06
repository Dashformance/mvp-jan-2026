import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { LeadsService } from '../leads/leads.service';
import { PrismaService } from '../prisma/prisma.service';

export interface AdvancedSearchParams {
    // Localização
    uf?: string[];
    municipio?: string[];
    bairro?: string[];
    cep?: string[];
    ddd?: string[];

    // Atividade Econômica
    codigo_atividade_principal?: string[];
    codigo_atividade_secundaria?: string[];
    incluir_atividade_secundaria?: boolean;
    codigo_natureza_juridica?: string[];

    // Situação
    situacao_cadastral?: string[];
    matriz_filial?: 'MATRIZ' | 'FILIAL';

    // Busca Textual
    busca_textual?: {
        texto: string[];
        tipo_busca: 'exata' | 'radical';
        razao_social: boolean;
        nome_fantasia: boolean;
        nome_socio: boolean;
    }[];

    // Datas e Capital
    data_abertura?: {
        inicio?: string;
        fim?: string;
        ultimos_dias?: number;
    };
    capital_social?: {
        minimo?: number;
        maximo?: number;
    };

    // Regime Tributário
    mei?: {
        optante?: boolean;
        excluir_optante?: boolean;
    };
    simples?: {
        optante?: boolean;
        excluir_optante?: boolean;
    };

    // Filtros Extras
    somente_matriz?: boolean;
    somente_filial?: boolean;
    com_email?: boolean;
    com_telefone?: boolean;
    somente_fixo?: boolean;
    somente_celular?: boolean;
    excluir_email_contab?: boolean;

    // Paginação
    limite?: number;
    pagina?: number;
}

@Injectable()
export class ExtractionService {
    constructor(
        private leadsService: LeadsService,
        private prisma: PrismaService
    ) { }

    private readonly baseUrl = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa';
    private readonly apiKey = process.env.CASA_DADOS_API_KEY;

    async searchCompanies(params: AdvancedSearchParams) {
        if (!this.apiKey) {
            throw new HttpException('API Key not configured on server', 500);
        }
        return this.fetchPage(params, params.pagina || 1);
    }

    async extractAndSave(params: AdvancedSearchParams, limit: number, dryRun: boolean = false) {
        if (!this.apiKey) {
            throw new HttpException('API Key not configured on server', 500);
        }

        let page = 1;
        let totalSaved = 0;
        let totalDuplicates = 0;
        let totalChecked = 0;
        let hasMore = true;
        let lastError: any = null;
        let candidates: any[] = [];

        try {
            console.log(`[DEBUG] extractAndSave called with limit=${limit}, dryRun=${dryRun}. Params keys:`, Object.keys(params));

            // Robust Deep Discovery Loop
            // If dryRun, we check candidates.length < limit. If saving, we check totalSaved < limit
            while ((dryRun ? candidates.length : totalSaved) < limit && hasMore && page <= 100) {
                console.log(`Deep Discovery: Scanning page ${page}... (Target: ${limit}, Saved/Candidates: ${dryRun ? candidates.length : totalSaved})`);

                const data = await this.fetchPage(params, page);
                const results = data.cnpjs || data.leads || [];

                if (results.length === 0) {
                    if (page === 1) {
                        const msg = `API returned 0 results on Page 1. Params: ${JSON.stringify(params)}`;
                        console.error(msg);
                        throw new HttpException(msg, 404);
                    }
                    console.log(`Deep Discovery: No more leads available at page ${page}. Search Exhausted.`);
                    hasMore = false;
                    break;
                }

                totalChecked += results.length;

                // 1. Quick identification of duplicates (Database check for CNPJs)
                const batchCnpjs = results.map((l: any) => l.cnpj);
                // Check against existing ACTIVE leads.
                const existingLeads = await this.prisma.lead.findMany({
                    where: { cnpj: { in: batchCnpjs }, deletedAt: null },
                    select: { cnpj: true }
                });
                const existingCnpjs = new Set(existingLeads.map(l => l.cnpj));

                // 1b. Also check by Email and Phone to catch filiais with same contact info
                const batchEmails = results
                    .map((l: any) => {
                        const email = l.contato_email?.[0];
                        return typeof email === 'string' ? email.toLowerCase().trim() : email?.email?.toLowerCase().trim();
                    })
                    .filter((e: string | undefined) => e && e.length > 5);

                const batchPhones = results
                    .map((l: any) => {
                        const phone = l.contato_telefonico?.[0];
                        let phoneStr = '';
                        if (typeof phone === 'string') phoneStr = phone;
                        else if (phone?.completo) phoneStr = phone.completo;
                        else if (phone?.ddd && phone?.numero) phoneStr = `${phone.ddd}${phone.numero}`;
                        return phoneStr.replace(/[^0-9]/g, '');
                    })
                    .filter((p: string) => p.length >= 8);

                const existingByEmail = batchEmails.length > 0 ? await this.prisma.lead.findMany({
                    where: { email: { in: batchEmails, mode: 'insensitive' }, deletedAt: null },
                    select: { email: true }
                }) : [];
                const existingEmails = new Set(existingByEmail.map(l => l.email?.toLowerCase()));

                const existingByPhone = batchPhones.length > 0 ? await this.prisma.lead.findMany({
                    where: { deletedAt: null },
                    select: { phone: true }
                }) : [];
                const existingPhones = new Set(
                    existingByPhone
                        .map(l => l.phone?.replace(/[^0-9]/g, ''))
                        .filter(p => p && p.length >= 8)
                );

                // Filter out leads that match CNPJ, Email, OR Phone
                const newLeadsOnPage = results.filter((l: any) => {
                    if (existingCnpjs.has(l.cnpj)) return false;

                    // Check email
                    const email = l.contato_email?.[0];
                    const emailStr = typeof email === 'string' ? email.toLowerCase().trim() : email?.email?.toLowerCase().trim();
                    if (emailStr && emailStr.length > 5 && existingEmails.has(emailStr)) return false;

                    // Check phone
                    const phone = l.contato_telefonico?.[0];
                    let phoneStr = '';
                    if (typeof phone === 'string') phoneStr = phone;
                    else if (phone?.completo) phoneStr = phone.completo;
                    else if (phone?.ddd && phone?.numero) phoneStr = `${phone.ddd}${phone.numero}`;
                    const normalizedPhone = phoneStr.replace(/[^0-9]/g, '');
                    if (normalizedPhone.length >= 8 && existingPhones.has(normalizedPhone)) return false;

                    return true;
                });

                const duplicatesOnPageCount = results.length - newLeadsOnPage.length;
                totalDuplicates += duplicatesOnPageCount;

                // 2. Smart Skip Logic
                if (newLeadsOnPage.length === 0) {
                    console.log(`Deep Discovery: Page ${page} is 100% duplicates. Jumping to next...`);
                    page++;
                    continue;
                }

                console.log(`Deep Discovery: Page ${page} found ${newLeadsOnPage.length} new candidates.`);

                // 3. Parallel Enrichment
                const enrichmentPromises = newLeadsOnPage.map(async (l: any) => {
                    const currentCount = dryRun ? candidates.length : totalSaved;
                    if (currentCount >= limit) return null;

                    try {
                        await new Promise(r => setTimeout(r, Math.random() * 100)); // Stagger
                        const details = await this.fetchCompanyDetails(l.cnpj);
                        return { ...l, ...details };
                    } catch (e) {
                        // If enrichment fails, we can still use the basic data
                        return l;
                    }
                });

                const batchResults = await Promise.all(enrichmentPromises);
                const validBatchResults = batchResults.filter(Boolean);

                if (validBatchResults.length === 0) {
                    page++;
                    continue;
                }

                // 4. Transform
                const leadsToProcess = validBatchResults.map((l: any) => {
                    let phone: string | null = null;
                    if (l.contato_telefonico && l.contato_telefonico.length > 0) {
                        // Sometimes array of objects, sometimes formatting might vary slightly
                        const firstPhone = l.contato_telefonico[0];
                        if (typeof firstPhone === 'string') {
                            phone = firstPhone;
                        } else if (firstPhone && typeof firstPhone === 'object') {
                            phone = firstPhone.completo || `${firstPhone.ddd || ''}${firstPhone.numero || ''}` || JSON.stringify(firstPhone);
                        }
                    }

                    let email = null;
                    if (l.contato_email && l.contato_email.length > 0) {
                        const firstEmail = l.contato_email[0];
                        email = typeof firstEmail === 'string' ? firstEmail : firstEmail?.email || null;
                    }

                    return {
                        company_name: l.razao_social,
                        trade_name: l.nome_fantasia || l.razao_social,
                        cnpj: l.cnpj,
                        phone: phone,
                        email: email,
                        status: 'NEW',
                        notes: `Deep Discovery (Page ${page})`,
                        // If dryRun, we might want extra meta, e.g. checked_at
                    };
                });

                if (dryRun) {
                    // Accumulate candidates with internal deduplication
                    const candidateEmails = new Set<string>(candidates.map((c: any) => c.email?.toLowerCase()).filter(Boolean));
                    const candidatePhones = new Set<string>(candidates.map((c: any) => c.phone?.replace(/[^0-9]/g, '')).filter((p: string) => p && p.length >= 8));

                    for (const lead of leadsToProcess) {
                        if ((candidates.length) >= limit) break;

                        // Check internal duplicates by email
                        const leadEmail = (lead as any).email?.toLowerCase();
                        if (leadEmail && leadEmail.length > 5 && candidateEmails.has(leadEmail)) {
                            totalDuplicates++;
                            continue;
                        }

                        // Check internal duplicates by phone
                        const leadPhone = (lead as any).phone?.replace(/[^0-9]/g, '');
                        if (leadPhone && leadPhone.length >= 8 && candidatePhones.has(leadPhone)) {
                            totalDuplicates++;
                            continue;
                        }

                        candidates.push(lead);
                        if (leadEmail) candidateEmails.add(leadEmail);
                        if (leadPhone && leadPhone.length >= 8) candidatePhones.add(leadPhone);
                    }
                } else {
                    const result = await this.leadsService.createMany(leadsToProcess as any);
                    totalSaved += result.count;
                    console.log(`Deep Discovery: Successfully saved ${result.count} new leads from page ${page}.`);
                }

                page++;
            }
        } catch (error) {
            const status = error.getStatus ? error.getStatus() : (error.response?.status || 500);
            const responseData = error.getResponse ? error.getResponse() : (error.response?.data || error.message);

            console.error(`Critical Discovery Error [${status}]:`, responseData);
            lastError = { message: typeof responseData === 'string' ? responseData : (responseData.message || error.message), status, details: responseData };
        }

        const searchExhausted = !hasMore || page > 100;
        console.log(`Deep Discovery Complete. Exhausted: ${searchExhausted}`);

        return {
            totalSaved,
            totalDuplicates,
            totalChecked,
            pagesScanned: page - 1,
            searchExhausted,
            candidates: dryRun ? candidates : [],
            error: lastError
        };
    }

    private async fetchCompanyDetails(cnpj: string) {
        try {
            const response = await axios.get(`https://api.casadosdados.com.br/v4/cnpj/${cnpj}`, {
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching details for ${cnpj}: ${error.message}`);
            return {};
        }
    }

    private buildPayload(params: AdvancedSearchParams, page: number): any {
        const payload: any = {
            pagina: page,
            limite: params.limite || 20
        };

        // Localização
        if (params.uf?.length) payload.uf = params.uf.map(u => u.toUpperCase());
        if (params.municipio?.length) payload.municipio = params.municipio.map(m => m.toLowerCase());
        if (params.bairro?.length) payload.bairro = params.bairro.map(b => b.toLowerCase());
        if (params.cep?.length) payload.cep = params.cep;
        if (params.ddd?.length) payload.ddd = params.ddd;

        // Atividade Econômica
        if (params.codigo_atividade_principal?.length) {
            payload.codigo_atividade_principal = params.codigo_atividade_principal;
        }
        if (params.codigo_atividade_secundaria?.length) {
            payload.codigo_atividade_secundaria = params.codigo_atividade_secundaria;
        }
        if (params.incluir_atividade_secundaria !== undefined) {
            payload.incluir_atividade_secundaria = params.incluir_atividade_secundaria;
        }
        if (params.codigo_natureza_juridica?.length) {
            payload.codigo_natureza_juridica = params.codigo_natureza_juridica;
        }

        // Situação
        if (params.situacao_cadastral?.length) {
            payload.situacao_cadastral = params.situacao_cadastral;
        } else {
            payload.situacao_cadastral = ["ATIVA"]; // Default
        }
        if (params.matriz_filial) {
            payload.matriz_filial = params.matriz_filial;
        }

        // Busca Textual
        if (params.busca_textual?.length) {
            payload.busca_textual = params.busca_textual;
        }

        // Datas e Capital
        if (params.data_abertura) {
            payload.data_abertura = {};
            if (params.data_abertura.inicio) payload.data_abertura.inicio = params.data_abertura.inicio;
            if (params.data_abertura.fim) payload.data_abertura.fim = params.data_abertura.fim;
            if (params.data_abertura.ultimos_dias) payload.data_abertura.ultimos_dias = params.data_abertura.ultimos_dias;
        }
        if (params.capital_social) {
            payload.capital_social = {};
            if (params.capital_social.minimo !== undefined) payload.capital_social.minimo = params.capital_social.minimo;
            if (params.capital_social.maximo !== undefined) payload.capital_social.maximo = params.capital_social.maximo;
        }

        // Regime Tributário
        if (params.mei) {
            payload.mei = params.mei;
        }
        if (params.simples) {
            payload.simples = params.simples;
        }

        // Filtros Extras (mais_filtros)
        const maisFilters: any = {};
        if (params.somente_matriz) maisFilters.somente_matriz = true;
        if (params.somente_filial) maisFilters.somente_filial = true;
        if (params.com_email) maisFilters.com_email = true;
        if (params.com_telefone) maisFilters.com_telefone = true;
        if (params.somente_fixo) maisFilters.somente_fixo = true;
        if (params.somente_celular) maisFilters.somente_celular = true;
        if (params.excluir_email_contab) maisFilters.excluir_email_contab = true;

        if (Object.keys(maisFilters).length > 0) {
            payload.mais_filtros = maisFilters;
        }

        return payload;
    }

    private async fetchPage(params: AdvancedSearchParams, page: number) {
        if (!this.apiKey) {
            throw new HttpException('API Key not configured on server', 500);
        }

        try {
            const payload = this.buildPayload(params, page);
            console.log(`[DEBUG] Extraction API Payload (Page ${page}):`, JSON.stringify(payload, null, 2));

            const response = await axios.post(this.baseUrl, payload, {
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });

            return response.data;
        } catch (error) {
            console.error('Casa dos Dados API Error:', error.response?.status, error.response?.data);
            throw new HttpException(
                error.response?.data || 'Failed to fetch from Casa dos Dados',
                error.response?.status || 500
            );
        }
    }
}
