import { IndustriesService } from './industries.service';
export declare class IndustriesController {
    private readonly industriesService;
    constructor(industriesService: IndustriesService);
    getIndustries(): Promise<import("../../entities/master").Industry[]>;
    getIndustryById(id: string): Promise<import("../../entities/master").Industry>;
}
