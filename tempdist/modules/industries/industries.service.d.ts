import { Repository } from 'typeorm';
import { Industry } from '../../entities/master/industry.entity';
export declare class IndustriesService {
    private readonly industryRepository;
    constructor(industryRepository: Repository<Industry>);
    getIndustries(): Promise<Industry[]>;
    getIndustryById(id: string): Promise<Industry>;
}
