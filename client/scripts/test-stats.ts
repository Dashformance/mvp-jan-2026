
import { LeadsService } from '../lib/services/leads-service';

async function main() {
    console.log('Testing LeadsService.getPerformanceByOwner...');
    try {
        const stats = await LeadsService.getPerformanceByOwner();
        console.log('Stats Keys:', Object.keys(stats));
        if (Object.keys(stats).length > 0) {
            const firstUser = Object.keys(stats)[0];
            console.log(`Meta for ${firstUser}:`, JSON.stringify(stats[firstUser].meta, null, 2));
        }

        console.log('\nTesting LeadsService.getStatsOverview...');
        const overview = await LeadsService.getStatsOverview();
        console.log('Overview:', JSON.stringify(overview, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
