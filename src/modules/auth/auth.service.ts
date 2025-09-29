// auth/auth.service.ts
import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RegistrationRepository } from '../registration/registration.repository';
import { UserEntity } from '../registration/entities/user.entity';
import {
  LoginDto,
  LoginResponseDto,
  UserInfoDto,
  RefreshTokenDto,
  RefreshResponseDto,
  RevokeTokenDto,
  LogoutDto,
  RenewSignaturesDto,
  ConfirmRenewSignaturesDto,
  AdminRevokeUserTokensDto,
  TokenIntrospectResponseDto,
} from './dtos';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  // Basic login method
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    const tokens = await this.generateTokens(user);
    const userInfo: UserInfoDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
    this.logger.log(`Successful login for user: ${user.email}`);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: userInfo,
    };
  }

  /**
   * Logout user by invalidating all refresh tokens
   */
  async logout(logoutDto: LogoutDto): Promise<void> {
    this.logger.log('User logout attempt');

    try {
      // First decode the refresh token to get the user ID (without verification)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.decode(logoutDto.refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token format');
      }

      // Verify the refresh token with the user's current secret key
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await this.verifyRefreshToken(logoutDto.refreshToken, decoded.sub);

      // Get user data
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const user = await this.registrationRepository.findById(decoded.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Regenerate both secret keys to invalidate ALL tokens (access and refresh)
      user.regenerateSecretKey();
      user.regenerateRefreshSecretKey();
      await this.registrationRepository.update(user.id, user);

      this.logger.log(`User logged out successfully: ${user.email}`);
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Private validation method
  private async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.registrationRepository.findByEmail(email);
      if (!user) return null;
      const isPasswordValid = await bcrypt.compare(password, user.password!);
      if (!isPasswordValid) return null;
      return user;
    } catch (error) {
      this.logger.error(`Error validating user: ${email}`, error);
      return null;
    }
  }

  // Private token generation method
  private async generateTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    };
    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: user.secretKey,
        expiresIn: '1h',
        algorithm: 'HS256',
        issuer: this.configService.get('jwt.issuer'),
        audience: this.configService.get('jwt.audience'),
      });
      const refreshPayload = { sub: user.id, type: 'refresh' };
      const refreshToken = await this.jwtService.signAsync(refreshPayload, {
        secret: user.refreshSecretKey,
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: this.configService.get('jwt.issuer'),
        audience: this.configService.get('jwt.audience'),
      });
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Error generating tokens for user: ${user.email}`,
        error,
      );
      throw new Error('Token generation failed');
    }
  }

  // Refresh token method
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    this.logger.log('Token refresh attempt');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.decode(refreshTokenDto.refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token format');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await this.verifyRefreshToken(refreshTokenDto.refreshToken, decoded.sub);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const user = await this.registrationRepository.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');
      if (!user.isActive)
        throw new UnauthorizedException('Account is deactivated');
      const tokens = await this.generateTokens(user);
      this.logger.log(`Token refreshed for user: ${user.email}`);
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'bearer',
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Revoke refresh token method
  async revokeRefreshToken(revokeTokenDto: RevokeTokenDto): Promise<void> {
    this.logger.log('Token revocation attempt');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.decode(revokeTokenDto.refreshToken);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token format');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await this.verifyRefreshToken(revokeTokenDto.refreshToken, decoded.sub);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const user = await this.registrationRepository.findById(decoded.sub);
      if (!user) throw new NotFoundException('User not found');
      user.regenerateRefreshSecretKey();
      await this.registrationRepository.update(user.id, user);
      this.logger.log(`Refresh token revoked for user: ${user.email}`);
    } catch (error) {
      this.logger.error('Token revocation failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Revoke all refresh tokens method
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    this.logger.log(`Revoke all tokens attempt for user: ${userId}`);
    try {
      const user = await this.registrationRepository.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      user.regenerateRefreshSecretKey();
      await this.registrationRepository.update(user.id, user);
      this.logger.log(`All refresh tokens revoked for user: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke all tokens for user: ${userId}`,
        error,
      );
      throw error;
    }
  }

  // Admin method to revoke all tokens for a specific user
  async adminRevokeUserTokens(
    adminRevokeDto: AdminRevokeUserTokensDto,
  ): Promise<void> {
    this.logger.log(
      `Admin revoke tokens attempt for user: ${adminRevokeDto.userId}`,
    );
    return await this.revokeAllRefreshTokens(adminRevokeDto.userId);
  }

  // Introspect token - validate and return token information
  async introspectToken(token: string): Promise<TokenIntrospectResponseDto> {
    this.logger.log('Token introspection request');

    try {
      // Decode token without verification first to get basic info
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.decode(token);

      if (!decoded) {
        return {
          active: false,
          error: 'Invalid token format',
        };
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (decoded.exp && decoded.exp < now) {
        return {
          active: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          sub: decoded.sub as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          iss: decoded.iss as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          aud: decoded.aud as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          exp: decoded.exp as number,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          iat: decoded.iat as number,
          error: 'Token has expired',
        };
      }

      // Try to verify the token with user's secret key
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        await this.verifyAccessToken(token, decoded.sub);
      } catch {
        return {
          active: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          sub: decoded.sub as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          iss: decoded.iss as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          aud: decoded.aud as string,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          exp: decoded.exp as number,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          iat: decoded.iat as number,
          error: 'Token signature invalid',
        };
      }

      // Get user information
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const user = await this.registrationRepository.findById(decoded.sub);
      if (!user) {
        return {
          active: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          sub: decoded.sub as string,
          error: 'User not found',
        };
      }

      // Return token information
      return {
        active: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        sub: decoded.sub as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        iss: decoded.iss as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        aud: decoded.aud as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        exp: decoded.exp as number,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        iat: decoded.iat as number,
        email: user.email,
        roles: ['user'], // Default role for now
        token_type: 'access',
      };
    } catch (error) {
      this.logger.error('Token introspection failed', error);
      return {
        active: false,
        error: 'Token introspection failed',
      };
    }
  }

  // Verify refresh token method
  async verifyRefreshToken(token: string, userId: string): Promise<any> {
    try {
      const user = await this.registrationRepository.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: user.refreshSecretKey,
        algorithms: ['HS256'],
        issuer: this.configService.get('jwt.issuer'),
        audience: this.configService.get('jwt.audience'),
      });
      return decoded;
    } catch (error) {
      this.logger.error(
        `Refresh token verification failed for user: ${userId}`,
        error,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Verify access token method
  async verifyAccessToken(token: string, userId: string): Promise<any> {
    try {
      const user = await this.registrationRepository.findById(userId);
      if (!user) throw new NotFoundException('User not found');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: user.secretKey,
        algorithms: ['HS256'],
        issuer: this.configService.get('jwt.issuer'),
        audience: this.configService.get('jwt.audience'),
      });
      return decoded;
    } catch (error) {
      this.logger.error(`Token verification failed for user: ${userId}`, error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Request signature renewal - sends verification code to user email
   */
  async requestRenewSignatures(renewDto: RenewSignaturesDto): Promise<void> {
    this.logger.log(`Signature renewal request for email: ${renewDto.email}`);

    try {
      // Find user by email
      const user = await this.registrationRepository.findByEmail(
        renewDto.email,
      );
      if (!user) {
        // Don't reveal if email exists or not for security
        this.logger.log(
          `Signature renewal requested for non-existent email: ${renewDto.email}`,
        );
        return; // Silent success to prevent email enumeration
      }

      // Check if user is active
      if (!user.isActive) {
        this.logger.log(
          `Signature renewal requested for inactive user: ${renewDto.email}`,
        );
        return; // Silent success
      }

      // Generate verification code and set expiration
      const verificationCode = UserEntity.generateActivationCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Update user with renewal verification code
      user.renewalVerificationToken = verificationCode;
      user.renewalVerificationTokenExpiresAt = expiresAt;
      await this.registrationRepository.update(user.id, user);

      // TODO: Send email with verification code
      // For now, just log it (in production, send via email service)
      this.logger.log(
        `Renewal verification code for ${user.email}: ${verificationCode}`,
      );

      this.logger.log(
        `Signature renewal verification code sent to: ${renewDto.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to request signature renewal for: ${renewDto.email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Confirm and execute signature renewal
   */
  async confirmRenewSignatures(
    confirmDto: ConfirmRenewSignaturesDto,
  ): Promise<void> {
    this.logger.log(
      `Signature renewal confirmation for email: ${confirmDto.email}`,
    );

    try {
      // Find user by email
      const user = await this.registrationRepository.findByEmail(
        confirmDto.email,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify renewal verification code
      if (
        !user.renewalVerificationToken ||
        !user.renewalVerificationTokenExpiresAt
      ) {
        throw new UnauthorizedException(
          'No renewal verification code requested',
        );
      }

      if (user.renewalVerificationToken !== confirmDto.verificationCode) {
        throw new UnauthorizedException('Invalid verification code');
      }

      if (new Date() > user.renewalVerificationTokenExpiresAt) {
        throw new UnauthorizedException('Verification code has expired');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(confirmDto.newPassword, 12);

      // Regenerate both secret keys to invalidate ALL existing tokens
      user.regenerateSecretKey();
      user.regenerateRefreshSecretKey();

      // Update password and clear verification tokens
      user.password = hashedPassword;
      user.renewalVerificationToken = undefined;
      user.renewalVerificationTokenExpiresAt = undefined;
      user.updatedAt = new Date();

      await this.registrationRepository.update(user.id, user);

      this.logger.log(
        `Signature renewal completed successfully for user: ${user.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Signature renewal confirmation failed for: ${confirmDto.email}`,
        error,
      );
      throw error;
    }
  }
}
