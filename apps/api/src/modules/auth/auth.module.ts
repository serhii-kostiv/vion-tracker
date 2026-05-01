import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { VerificationModule } from './verification/verification.module';
import { SessionModule } from './session/session.module';
import { PasswordRecoveryModule } from './password-recovery/password-recovery.module';
import { DeactivateModule } from './deactivate/deactivate.module';

@Module({
  imports: [
    VerificationModule, // має бути першим — AccountModule та SessionModule залежать від нього
    AccountModule,
    SessionModule,
    PasswordRecoveryModule,
    DeactivateModule,
  ],
})
export class AuthModule {}
