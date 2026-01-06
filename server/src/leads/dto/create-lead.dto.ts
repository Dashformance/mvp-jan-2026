import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

export enum LeadStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    RESPONDED = 'RESPONDED',
    MEETING_SCHEDULED = 'MEETING_SCHEDULED',
    QUALIFIED = 'QUALIFIED',
    CLOSED = 'CLOSED',
    DISCARDED = 'DISCARDED',
}

export class CreateLeadDto {
    @IsString()
    @IsNotEmpty()
    company_name: string;

    @IsString()
    @IsNotEmpty()
    trade_name: string;

    @IsString()
    @IsNotEmpty()
    cnpj: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    decision_maker?: string;

    @IsOptional()
    extra_info?: any;

    @IsString()
    @IsOptional()
    segment_id?: string;

    @IsEnum(LeadStatus)
    @IsOptional()
    status?: LeadStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}
