
import { LeadsService } from '../lib/services/leads-service';

async function main() {
    console.log('--- TESTING LEADS SERVICE API ---');
    const seasonalStart = new Date('2026-01-01T00:00:00-03:00');
    const stats = await LeadsService.getPerformanceByOwner(seasonalStart);

    console.log(JSON.stringify(stats, null, 2));
}

main().catch(e => console.error(e));
