import axios from 'axios';
import { LeadsService } from './leads-service';
import prisma from '../prisma';

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

export class ExtractionService {
    private static readonly baseUrl = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa';
    private static readonly apiKey = process.env.CASA_DADOS_API_KEY;

    static async searchCompanies(params: AdvancedSearchParams) {
        if (!this.apiKey) {
            throw new Error('API Key not configured');
        }
        return this.fetchPage(params, params.pagina || 1);
    }

    static async extractAndSave(params: AdvancedSearchParams, limit: number, dryRun: boolean = false) {
        if (!this.apiKey) {
            throw new Error('API Key not configured');
        }

        let page = 1;
        let totalSaved = 0;
        let totalDuplicates = 0;
        let totalChecked = 0;
        let hasMore = true;
        let lastError: any = null;
        let candidates: any[] = [];

        try {
            while ((dryRun ? candidates.length : totalSaved) < limit && hasMore && page <= 100) {
                const data = await this.fetchPage(params, page);
                const results = data.cnpjs || data.leads || [];

                if (results.length === 0) {
                    if (page === 1) throw new Error('API returned 0 results');
                    hasMore = false;
                    break;
                }

                totalChecked += results.length;

                const batchCnpjs = results.map((l: any) => l.cnpj);
                const existingLeads = await prisma.lead.findMany({
                    where: { cnpj: { in: batchCnpjs }, deletedAt: null },
                    select: { cnpj: true }
                });
                const existingCnpjs = new Set(existingLeads.map((l: any) => l.cnpj));

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

                const existingByEmail = batchEmails.length > 0 ? await prisma.lead.findMany({
                    where: { email: { in: batchEmails, mode: 'insensitive' }, deletedAt: null },
                    select: { email: true }
                }) : [];
                const existingEmails = new Set(existingByEmail.map((l: any) => l.email?.toLowerCase()));

                const existingByPhone = batchPhones.length > 0 ? await prisma.lead.findMany({
                    where: { deletedAt: null },
                    select: { phone: true }
                }) : [];
                const existingPhones = new Set(
                    existingByPhone
                        .map((l: any) => l.phone?.replace(/[^0-9]/g, ''))
                        .filter((p: any) => p && p.length >= 8)
                );

                const newLeadsOnPage = results.filter((l: any) => {
                    if (existingCnpjs.has(l.cnpj)) return false;
                    const email = l.contato_email?.[0];
                    const emailStr = typeof email === 'string' ? email.toLowerCase().trim() : email?.email?.toLowerCase().trim();
                    if (emailStr && emailStr.length > 5 && existingEmails.has(emailStr)) return false;
                    const phone = l.contato_telefonico?.[0];
                    let phoneStr = '';
                    if (typeof phone === 'string') phoneStr = phone;
                    else if (phone?.completo) phoneStr = phone.completo;
                    else if (phone?.ddd && phone?.numero) phoneStr = `${phone.ddd}${phone.numero}`;
                    const normalizedPhone = phoneStr.replace(/[^0-9]/g, '');
                    if (normalizedPhone.length >= 8 && existingPhones.has(normalizedPhone)) return false;
                    return true;
                });

                totalDuplicates += results.length - newLeadsOnPage.length;

                if (newLeadsOnPage.length === 0) {
                    page++;
                    continue;
                }

                const enrichmentPromises = newLeadsOnPage.map(async (l: any) => {
                    const currentCount = dryRun ? candidates.length : totalSaved;
                    if (currentCount >= limit) return null;
                    try {
                        await new Promise(r => setTimeout(r, Math.random() * 50));
                        const details = await this.fetchCompanyDetails(l.cnpj);
                        return { ...l, ...details };
                    } catch (e) {
                        return l;
                    }
                });

                const batchResults = await Promise.all(enrichmentPromises);
                const validBatchResults = batchResults.filter(Boolean);

                if (validBatchResults.length === 0) {
                    page++;
                    continue;
                }

                const leadsToProcess = validBatchResults.map((l: any) => {
                    let phone: string | null = null;
                    if (l.contato_telefonico && l.contato_telefonico.length > 0) {
                        const firstPhone = l.contato_telefonico[0];
                        if (typeof firstPhone === 'string') phone = firstPhone;
                        else if (firstPhone && typeof firstPhone === 'object') {
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
                        notes: `Extraction (Page ${page})`,
                        extra_info: l
                    };
                });

                if (dryRun) {
                    const candidateEmails = new Set<string>(candidates.map((c: any) => c.email?.toLowerCase()).filter(Boolean));
                    const candidatePhones = new Set<string>(candidates.map((c: any) => c.phone?.replace(/[^0-9]/g, '')).filter((p: string) => p && p.length >= 8));

                    for (const lead of leadsToProcess) {
                        const l = lead as any;
                        if ((candidates.length) >= limit) break;
                        const leadEmail = l.email?.toLowerCase();
                        if (leadEmail && leadEmail.length > 5 && candidateEmails.has(leadEmail)) {
                            totalDuplicates++;
                            continue;
                        }
                        const leadPhone = l.phone?.replace(/[^0-9]/g, '');
                        if (leadPhone && leadPhone.length >= 8 && candidatePhones.has(leadPhone)) {
                            totalDuplicates++;
                            continue;
                        }
                        candidates.push(l);
                        if (leadEmail) candidateEmails.add(leadEmail);
                        if (leadPhone && leadPhone.length >= 8) candidatePhones.add(leadPhone);
                    }
                } else {
                    const result = await LeadsService.createMany(leadsToProcess as any);
                    totalSaved += result.count;
                }
                page++;
            }
        } catch (error: any) {
            lastError = { message: error.message };
        }

        return {
            totalSaved,
            totalDuplicates,
            totalChecked,
            pagesScanned: page - 1,
            searchExhausted: !hasMore || page > 100,
            candidates: dryRun ? candidates : [],
            error: lastError
        };
    }

    private static async fetchCompanyDetails(cnpj: string) {
        try {
            const response = await axios.get(`https://api.casadosdados.com.br/v4/cnpj/${cnpj}`, {
                headers: { 'api-key': this.apiKey as string, 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            return {};
        }
    }

    private static buildPayload(params: AdvancedSearchParams, page: number): any {
        const payload: any = { pagina: page, limite: params.limite || 40 };
        if (params.uf?.length) payload.uf = params.uf.map((u: string) => u.toUpperCase());
        if (params.municipio?.length) payload.municipio = params.municipio.map((m: string) => m.toLowerCase());
        if (params.bairro?.length) payload.bairro = params.bairro.map((b: string) => b.toLowerCase());
        if (params.cep?.length) payload.cep = params.cep;
        if (params.ddd?.length) payload.ddd = params.ddd;
        if (params.codigo_atividade_principal?.length) payload.codigo_atividade_principal = params.codigo_atividade_principal;
        if (params.codigo_atividade_secundaria?.length) payload.codigo_atividade_secundaria = params.codigo_atividade_secundaria;
        if (params.incluir_atividade_secundaria !== undefined) payload.incluir_atividade_secundaria = params.incluir_atividade_secundaria;
        if (params.codigo_natureza_juridica?.length) payload.codigo_natureza_juridica = params.codigo_natureza_juridica;
        payload.situacao_cadastral = params.situacao_cadastral?.length ? params.situacao_cadastral : ["ATIVA"];
        if (params.matriz_filial) payload.matriz_filial = params.matriz_filial;
        if (params.busca_textual?.length) payload.busca_textual = params.busca_textual;
        if (params.data_abertura) payload.data_abertura = params.data_abertura;
        if (params.capital_social) payload.capital_social = params.capital_social;
        if (params.mei) payload.mei = params.mei;
        if (params.simples) payload.simples = params.simples;
        const maisFilters: any = {};
        if (params.somente_matriz) maisFilters.somente_matriz = true;
        if (params.somente_filial) maisFilters.somente_filial = true;
        if (params.com_email) maisFilters.com_email = true;
        if (params.com_telefone) maisFilters.com_telefone = true;
        if (params.somente_fixo) maisFilters.somente_fixo = true;
        if (params.somente_celular) maisFilters.somente_celular = true;
        if (params.excluir_email_contab) maisFilters.excluir_email_contab = true;
        if (Object.keys(maisFilters).length > 0) payload.mais_filtros = maisFilters;
        return payload;
    }

    private static async fetchPage(params: AdvancedSearchParams, page: number) {
        if (!this.apiKey) throw new Error('API Key missing');
        const payload = this.buildPayload(params, page);
        const response = await axios.post(this.baseUrl, payload, {
            headers: { 'api-key': this.apiKey as string, 'Content-Type': 'application/json' },
            timeout: 30000
        });
        return response.data;
    }
}
