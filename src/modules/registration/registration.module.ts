/**
 * Módulo de Registration
 * Organiza y configura todos los componentes del módulo de registro
 */

import { Module } from '@nestjs/common';
import { RegistrationController } from './controllers';
import { RegistrationService } from './services';
import { RegistrationRepository } from './repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationRepository],
  exports: [RegistrationService],
})
export class RegistrationModule {}
