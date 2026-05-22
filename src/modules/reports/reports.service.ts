import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { PaginationReportDto } from './dto/pagination-report.dto';
import { ReportType } from './report-type.entity';

const REPORT_RELATIONS = [
  'reporter',
  'reporter.user',
  'job',
  'job.employer',
  'reportType',
];

@Injectable()
export class ReportsService {
  constructor(
    // @InjectRepository(Report)
    // private repo: Repository<Report>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(ReportType)
    private readonly reportTypeRepository: Repository<ReportType>,
  ) {}

  async getReports(paginationDto: PaginationReportDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [reports, total] = await this.reportRepository.findAndCount({
      relations: REPORT_RELATIONS,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: reports,
      meta: {
        totalItems: total,
        itemCount: reports.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async create(data: Partial<Report>) {
    // Let the database default handle status if not provided
    const report = this.reportRepository.create(data);
    return await this.reportRepository.save(report);
  }

}
