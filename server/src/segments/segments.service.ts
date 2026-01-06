import { Injectable } from '@nestjs/common';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) { }

  create(createSegmentDto: CreateSegmentDto) {
    return this.prisma.segment.create({
      data: createSegmentDto,
    });
  }

  findAll() {
    return this.prisma.segment.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.segment.findUnique({
      where: { id },
    });
  }

  update(id: string, updateSegmentDto: UpdateSegmentDto) {
    return this.prisma.segment.update({
      where: { id },
      data: updateSegmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.segment.delete({
      where: { id },
    });
  }
}
