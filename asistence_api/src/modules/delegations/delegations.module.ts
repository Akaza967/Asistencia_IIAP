import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanDelegation } from './entities/delegation.entity';
import { User } from '../users/entities/user.entity';
import { DelegationsService } from './delegations.service';
import { DelegationsController } from './delegations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanDelegation, User]),
  ],
  providers: [DelegationsService],
  controllers: [DelegationsController],
  exports: [DelegationsService],
})
export class DelegationsModule {}
