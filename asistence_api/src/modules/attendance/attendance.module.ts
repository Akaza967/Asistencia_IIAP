import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './entities/attendance.entity';
import { ScheduleModule } from '../schedule/schedule.module';
import { ProjectsModule } from '../projects/projects.module';
import { DelegationsModule } from '../delegations/delegations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    ScheduleModule,
    ProjectsModule,
    DelegationsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
