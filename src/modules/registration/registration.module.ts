// registration.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RegistrationRepository } from './registration.repository';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationRepository],
  exports: [RegistrationService, RegistrationRepository],
})
export class RegistrationModule {}
