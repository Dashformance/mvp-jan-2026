import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) { }

  async create(createLeadDto: CreateLeadDto) {
    const data: Prisma.LeadUncheckedCreateInput = createLeadDto as any;
    return this.prisma.lead.create({
      data,
    });
  }

  async createMany(leads: CreateLeadDto[]) {
    // We use transaction of upserts to handle soft-deleted leads correctly (restore them)
    // and to update existing data if necessary.
    const ops = leads.map(lead => {
      const data = { ...lead, deletedAt: null };
      return this.prisma.lead.upsert({
        where: { cnpj: lead.cnpj },
        create: data as any,
        update: data as any,
      });
    });

    const results = await this.prisma.$transaction(ops);
    return { count: results.length };
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [leads, total, joaoTotal, vitorTotal, unassignedTotal] = await Promise.all([
      this.prisma.lead.findMany({
        skip,
        take: Number(limit),
        where: { deletedAt: null },
        orderBy: { date_added: 'desc' },
      }),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.count({ where: { OR: [{ owner: 'joao' }, { owner: null }, { owner: '' }], deletedAt: null } }),
      this.prisma.lead.count({ where: { owner: 'vitor', deletedAt: null } }),
      this.prisma.lead.count({ where: { OR: [{ owner: null }, { owner: '' }], deletedAt: null } }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        joaoTotal,
        vitorTotal,
        unassignedTotal,
        page: Number(page),
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { segment: true }
    });
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    // Cast to any to bypass compatibility with partial enum update issues
    const data: Prisma.LeadUncheckedUpdateInput = updateLeadDto as any;
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async removeMany(ids: string[]) {
    return this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });
  }

  async restore(id: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  async restoreMany(ids: string[]) {
    return this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: null }
    });
  }

  async hardDelete(id: string) {
    return this.prisma.lead.delete({
      where: { id }
    });
  }

  async findAllTrashed() {
    return this.prisma.lead.findMany({
      where: { NOT: { deletedAt: null } },
      orderBy: { deletedAt: 'desc' }
    });
  }

  async updateMany(ids: string[], updateData: Partial<UpdateLeadDto>) {
    const data: Prisma.LeadUncheckedUpdateManyInput = updateData as any;
    return this.prisma.lead.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async cleanupDuplicates() {
    // Fetch all active leads
    const allLeads = await this.prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { date_added: 'asc' } // Oldest first
    });

    const toDeleteIds = new Set<string>();

    const checkDuplicates = (keyFn: (l: any) => string | null) => {
      const groups = new Map<string, any[]>();

      for (const lead of allLeads) {
        const key = keyFn(lead);
        if (!key) continue;

        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(lead);
      }

      for (const [key, group] of groups) {
        if (group.length > 1) {
          // Conflict Resolution Priority:
          // 1. Keep leads with USER notes (not auto-generated)
          // 2. Among remaining, prioritize leads with more data (email + phone)
          // 3. Finally, keep the oldest one

          const withUserNotes = group.filter(l => {
            if (!l.notes || l.notes.trim().length === 0) return false;
            const note = l.notes.toLowerCase().trim();
            if (note.startsWith('deep discovery')) return false;
            return true;
          });

          let keptLeads: any[] = [];

          if (withUserNotes.length > 0) {
            // Keep ALL with user notes - safety first
            keptLeads = withUserNotes;
          } else {
            // Score leads by completeness: email = 1pt, phone = 1pt
            const scored = group.map(l => ({
              lead: l,
              score: (l.email && l.email.trim().length > 5 ? 1 : 0) +
                (l.phone && l.phone.replace(/[^0-9]/g, '').length >= 8 ? 1 : 0)
            }));

            // Find max score
            const maxScore = Math.max(...scored.map(s => s.score));

            // Keep all with max score (in case of ties, keep oldest among them)
            const bestLeads = scored.filter(s => s.score === maxScore).map(s => s.lead);

            // Among best leads, keep only the oldest one
            keptLeads = [bestLeads[0]]; // Already sorted by date_added ASC
          }

          const keptIds = new Set(keptLeads.map(l => l.id));

          // Mark others for deletion
          for (const lead of group) {
            if (!keptIds.has(lead.id)) {
              toDeleteIds.add(lead.id);
            }
          }
        }
      }
    };

    // Check Email Duplicates
    checkDuplicates(l => (l.email && l.email.trim().length > 5) ? l.email.toLowerCase().trim() : null);

    // Check Phone Duplicates
    checkDuplicates(l => {
      if (!l.phone) return null;
      // Remove all non-numeric characters
      const p = l.phone.replace(/[^0-9]/g, '');
      // Ensure phone has at least 8 digits to be considered "valid enough" for deduplication
      if (p.length < 8) return null;
      return p;
    });

    if (toDeleteIds.size > 0) {
      const ids = Array.from(toDeleteIds);
      await this.removeMany(ids);
      return { deletedCount: ids.length, ids };
    }

    return { deletedCount: 0, ids: [] };
  }

  async divideLeads(joaoCount: number, sourceOwner: 'unassigned' | 'joao' | 'vitor' | 'all' = 'unassigned') {
    // Build where clause based on source
    const where: any = { deletedAt: null };

    if (sourceOwner === 'unassigned') {
      where.OR = [{ owner: null }, { owner: '' }];
    } else if (sourceOwner !== 'all') {
      where.owner = sourceOwner;
    }

    // Fetch leads based on source filter
    const leadsToDivide = await this.prisma.lead.findMany({
      where,
      select: { id: true },
      orderBy: { date_added: 'asc' }
    });

    if (leadsToDivide.length === 0) {
      return { joaoCount: 0, vitorCount: 0, total: 0 };
    }

    // Shuffle for fairness (Fisher-Yates)
    const ids = leadsToDivide.map(l => l.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    // Split according to joaoCount
    // Ensure joaoCount doesn't exceed total available
    const safeJoaoCount = Math.min(joaoCount, ids.length);

    const joaoIds = ids.slice(0, safeJoaoCount);
    const vitorIds = ids.slice(safeJoaoCount);

    // Assign to João
    if (joaoIds.length > 0) {
      await this.prisma.lead.updateMany({
        where: { id: { in: joaoIds } },
        data: { owner: 'joao' }
      });
    }

    // Assign to Vitor
    if (vitorIds.length > 0) {
      await this.prisma.lead.updateMany({
        where: { id: { in: vitorIds } },
        data: { owner: 'vitor' }
      });
    }

    return {
      joaoCount: joaoIds.length,
      vitorCount: vitorIds.length,
      total: ids.length
    };
  }

  // ==================== ANALYTICS ====================

  async getStatsOverview() {
    const [
      total,
      byStatus,
      byOwner,
      addedToday,
      addedThisWeek,
      addedThisMonth
    ] = await Promise.all([
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { status: true }
      }),
      this.prisma.lead.groupBy({
        by: ['owner'],
        where: { deletedAt: null },
        _count: { owner: true }
      }),
      this.prisma.lead.count({
        where: {
          deletedAt: null,
          date_added: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      }),
      this.prisma.lead.count({
        where: {
          deletedAt: null,
          date_added: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      this.prisma.lead.count({
        where: {
          deletedAt: null,
          date_added: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach(s => { statusCounts[s.status] = s._count.status; });

    const ownerCounts: Record<string, number> = {};
    byOwner.forEach(o => { ownerCounts[o.owner || 'unassigned'] = o._count.owner; });

    return {
      total,
      byStatus: statusCounts,
      byOwner: ownerCounts,
      addedToday,
      addedThisWeek,
      addedThisMonth
    };
  }

  async getConversionFunnel() {
    const statuses = ['NEW', 'ATTEMPTED', 'CONTACTED', 'MEETING', 'WON', 'LOST'];
    const counts = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true }
    });

    const countMap: Record<string, number> = {};
    counts.forEach(c => { countMap[c.status] = c._count.status; });

    const total = Object.values(countMap).reduce((a, b) => a + b, 0);

    return statuses.map(status => ({
      status,
      count: countMap[status] || 0,
      percentage: total > 0 ? Math.round(((countMap[status] || 0) / total) * 100) : 0
    }));
  }

  async getTimelineStats(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const leads = await this.prisma.lead.findMany({
      where: {
        deletedAt: null,
        date_added: { gte: startDate }
      },
      select: { date_added: true, status: true }
    });

    // Group by date
    const byDate: Record<string, { added: number, won: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      byDate[key] = { added: 0, won: 0 };
    }

    leads.forEach(lead => {
      const key = lead.date_added.toISOString().split('T')[0];
      if (byDate[key]) {
        byDate[key].added++;
        if (lead.status === 'WON') byDate[key].won++;
      }
    });

    return Object.entries(byDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPerformanceByOwner() {
    const [byOwnerStatus, totalByOwner] = await Promise.all([
      this.prisma.lead.groupBy({
        by: ['owner', 'status'],
        where: { deletedAt: null },
        _count: { id: true }
      }),
      this.prisma.lead.groupBy({
        by: ['owner'],
        where: { deletedAt: null },
        _count: { id: true }
      })
    ]);

    const owners = ['joao', 'vitor'];
    const result: Record<string, any> = {};

    owners.forEach(owner => {
      const ownerData = byOwnerStatus.filter(d => d.owner === owner);
      const total = totalByOwner.find(t => t.owner === owner)?._count.id || 0;
      const won = ownerData.find(d => d.status === 'WON')?._count.id || 0;
      const contacted = ownerData.find(d => d.status === 'CONTACTED')?._count.id || 0;
      const meeting = ownerData.find(d => d.status === 'MEETING')?._count.id || 0;

      result[owner] = {
        total,
        won,
        contacted,
        meeting,
        conversionRate: total > 0 ? Math.round((won / total) * 100) : 0
      };
    });

    return result;
  }

  async getLeadsByState() {
    const leads = await this.prisma.lead.findMany({
      where: { deletedAt: null },
      select: { extra_info: true }
    });

    // Region mapping
    const regionStates: Record<string, string[]> = {
      'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
      'Sul': ['PR', 'SC', 'RS'],
      'Nordeste': ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI'],
      'Centro-Oeste': ['GO', 'MT', 'MS', 'DF'],
      'Norte': ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'],
    };

    const regionData: Record<string, number> = {
      'Sudeste': 0,
      'Sul': 0,
      'Nordeste': 0,
      'Centro-Oeste': 0,
      'Norte': 0,
      'Sem UF': 0,
    };

    leads.forEach(lead => {
      const info = lead.extra_info as any;
      const uf = info?.uf || info?.estado?.sigla || info?.endereco?.uf;

      if (uf && typeof uf === 'string') {
        const upperUf = uf.toUpperCase();
        let found = false;
        for (const [region, states] of Object.entries(regionStates)) {
          if (states.includes(upperUf)) {
            regionData[region]++;
            found = true;
            break;
          }
        }
        if (!found) {
          regionData['Sem UF']++;
        }
      } else {
        regionData['Sem UF']++;
      }
    });

    const total = Object.values(regionData).reduce((a, b) => a + b, 0);

    return {
      byRegion: regionData,
      total
    };
  }

  async getSalesForce() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get activity counts per owner for different periods
    const owners = ['joao', 'vitor'];
    const result: Record<string, any> = {};

    for (const owner of owners) {
      const [
        contactedToday,
        contactedWeek,
        contactedMonth,
        meetingsToday,
        meetingsWeek,
        meetingsMonth,
        wonToday,
        wonWeek,
        wonMonth,
        totalActive
      ] = await Promise.all([
        // Contacted today
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            last_contact_date: { gte: startOfDay }
          }
        }),
        // Contacted this week
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            last_contact_date: { gte: startOfWeek }
          }
        }),
        // Contacted this month
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            last_contact_date: { gte: startOfMonth }
          }
        }),
        // Meetings scheduled today
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'MEETING',
            next_followup_date: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) }
          }
        }),
        // Meetings this week
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'MEETING'
          }
        }),
        // Status changed to MEETING this month
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'MEETING',
          }
        }),
        // Won today (approximate by checking WON status)
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'WON',
            last_contact_date: { gte: startOfDay }
          }
        }),
        // Won this week
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'WON',
            last_contact_date: { gte: startOfWeek }
          }
        }),
        // Won this month
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: 'WON',
            last_contact_date: { gte: startOfMonth }
          }
        }),
        // Total active leads
        this.prisma.lead.count({
          where: {
            owner,
            deletedAt: null,
            status: { notIn: ['WON', 'LOST'] }
          }
        }),
      ]);

      result[owner] = {
        today: {
          contacted: contactedToday,
          meetings: meetingsToday,
          won: wonToday,
        },
        week: {
          contacted: contactedWeek,
          meetings: meetingsWeek,
          won: wonWeek,
        },
        month: {
          contacted: contactedMonth,
          meetings: meetingsMonth,
          won: wonMonth,
        },
        totalActive,
        // Calculate a "score" for gamification
        score: {
          today: contactedToday * 1 + meetingsToday * 3 + wonToday * 10,
          week: contactedWeek * 1 + meetingsWeek * 3 + wonWeek * 10,
          month: contactedMonth * 1 + meetingsMonth * 3 + wonMonth * 10,
        }
      };
    }

    return result;
  }
}




