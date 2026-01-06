import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSegmentDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}
