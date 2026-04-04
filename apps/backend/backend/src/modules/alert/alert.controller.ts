import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { AlertService } from './alert.service';
import { CreateAlertDto } from './alert.types';

@Controller('alerts')
export class AlertController {
    constructor(private readonly alertService: AlertService) { }

    @Post()
    create(@Body() dto: CreateAlertDto) {
        return this.alertService.createAlert(dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        this.alertService.deleteAlert(id);
        return { success: true };
    }

    @Get()
    list() {
        return this.alertService.getAlerts();
    }
}
