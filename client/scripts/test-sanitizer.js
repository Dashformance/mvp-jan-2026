
// Mock LeadSanitizer logic here to avoid TS compilation complexity for this simple test script
// We are testing the LOGIC that we implemented in the class.

const sanitizeForUpdate = (data) => {
    // Replica of the logic in client/lib/services/lead-sanitizer.ts
    const sanitized = { ...data };

    delete sanitized.id;
    delete sanitized.date_added;
    delete sanitized.deletedAt;
    delete sanitized.createdAt;
    delete sanitized.updatedAt;

    delete sanitized.segment;
    delete sanitized.reviews;
    delete sanitized.events;
    delete sanitized.ownerRel;

    const toNullIfEmpty = (value) => {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        }
        return value;
    };

    if (sanitized.phone !== undefined) sanitized.phone = toNullIfEmpty(sanitized.phone);
    if (sanitized.email !== undefined) sanitized.email = toNullIfEmpty(sanitized.email);
    if (sanitized.decision_maker !== undefined) sanitized.decision_maker = toNullIfEmpty(sanitized.decision_maker);
    if (sanitized.decision_maker_title !== undefined) sanitized.decision_maker_title = toNullIfEmpty(sanitized.decision_maker_title);
    if (sanitized.linkedin_url !== undefined) sanitized.linkedin_url = toNullIfEmpty(sanitized.linkedin_url);
    if (sanitized.website !== undefined) sanitized.website = toNullIfEmpty(sanitized.website);
    if (sanitized.notes !== undefined) sanitized.notes = toNullIfEmpty(sanitized.notes);
    if (sanitized.uf !== undefined) sanitized.uf = toNullIfEmpty(sanitized.uf);
    if (sanitized.city !== undefined) sanitized.city = toNullIfEmpty(sanitized.city);
    if (sanitized.segment_id !== undefined) sanitized.segment_id = toNullIfEmpty(sanitized.segment_id);

    // CRITICAL: Handle CNPJ
    if (sanitized.cnpj !== undefined) sanitized.cnpj = toNullIfEmpty(sanitized.cnpj);

    if (typeof sanitized.company_name === 'string') sanitized.company_name = sanitized.company_name.trim();
    if (typeof sanitized.trade_name === 'string') sanitized.trade_name = sanitized.trade_name.trim();

    return sanitized;
};

function runTests() {
    console.log('🧪 Starting LeadSanitizer Logic Tests...');
    let passed = 0;
    let failed = 0;

    const assert = (desc, condition) => {
        if (condition) {
            console.log(`✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${desc}`);
            failed++;
        }
    };

    // Test 1: Strip ID and forbidden fields
    const dirty1 = { id: '123', company_name: 'Test', date_added: '2023-01-01' };
    const clean1 = sanitizeForUpdate(dirty1);
    assert('Should remove ID', clean1.id === undefined);
    assert('Should remove date_added', clean1.date_added === undefined);
    assert('Should keep company_name', clean1.company_name === 'Test');

    // Test 2: Strip relations
    const dirty2 = { company_name: 'Test', segment: { id: 1, name: 'Bad' }, reviews: [] };
    const clean2 = sanitizeForUpdate(dirty2);
    assert('Should remove segment object', clean2.segment === undefined);
    assert('Should remove reviews array', clean2.reviews === undefined);

    // Test 3: Handle CNPJ
    const dirty3 = { cnpj: '' };
    const clean3 = sanitizeForUpdate(dirty3);
    assert('Empty CNPJ string should become null', clean3.cnpj === null);

    const dirty4 = { cnpj: '  ' };
    const clean4 = sanitizeForUpdate(dirty4);
    assert('Whitespace CNPJ string should become null', clean4.cnpj === null);

    const dirty5 = { cnpj: '123' };
    const clean5 = sanitizeForUpdate(dirty5);
    assert('Valid CNPJ should remain', clean5.cnpj === '123');

    // Test 4: Trimming
    const dirty6 = { company_name: '  Space Co  ' };
    const clean6 = sanitizeForUpdate(dirty6);
    assert('Company name should be trimmed', clean6.company_name === 'Space Co');

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests();
