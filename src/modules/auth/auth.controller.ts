// auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtGuard } from '../../shared/guards/jwt.guard';
import { RbacGuard, RequireAdmin } from '../../shared/guards/rbac.guard';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshResponseDto,
  RevokeTokenDto,
  LogoutDto,
  RenewSignaturesDto,
  ConfirmRenewSignaturesDto,
  AdminRevokeUserTokensDto,
  TokenIntrospectResponseDto,
  IntrospectTokenDto,
} from './dtos';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password, returns JWT tokens',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Example login request',
        description: 'Standard user login with email and password',
        value: {
          email: 'test@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 'cmg32kf5z0000d55o3gox11za',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          emailVerified: false,
          createdAt: '2025-09-27T23:17:18.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account deactivated',
    schema: {
      example: {
        message: 'Invalid credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['Please provide a valid email address'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    this.logger.log(`Login request for email: ${loginDto.email}`);
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token for token renewal',
    examples: {
      'refresh-token': {
        summary: 'Token refresh request',
        description: 'Request to refresh access token',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshResponseDto,
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'bearer',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['refreshToken should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshResponseDto> {
    this.logger.log('Token refresh request');
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Post('revoke')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke refresh token',
    description: 'Revoke a specific refresh token to prevent further use',
  })
  @ApiBody({
    type: RevokeTokenDto,
    description: 'Refresh token to revoke',
    examples: {
      'revoke-token': {
        summary: 'Token revocation request',
        description: 'Request to revoke a refresh token',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Token revoked successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['refreshToken should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async revokeToken(@Body() revokeTokenDto: RevokeTokenDto): Promise<void> {
    this.logger.log('Token revocation request');
    return await this.authService.revokeRefreshToken(revokeTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate all tokens (access and refresh)',
  })
  @ApiBody({
    type: LogoutDto,
    description: 'Refresh token for logout',
    examples: {
      logout: {
        summary: 'Logout request',
        description: 'Request to logout and invalidate all user tokens',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'User logged out successfully - all tokens invalidated',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['refreshToken should not be empty'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async logout(@Body() logoutDto: LogoutDto): Promise<void> {
    this.logger.log('User logout request');
    return await this.authService.logout(logoutDto);
  }

  @Post('renew-signatures')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Request signature renewal',
    description:
      'Request renewal of user signatures by sending verification code to email',
  })
  @ApiBody({
    type: RenewSignaturesDto,
    description: 'Email address for signature renewal request',
    examples: {
      'renew-signatures': {
        summary: 'Signature renewal request',
        description: 'Request to renew user signatures',
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 202,
    description: 'Renewal verification code sent to email',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: ['email must be a valid email address'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  async renewSignatures(@Body() renewDto: RenewSignaturesDto): Promise<void> {
    this.logger.log(`Signature renewal request for email: ${renewDto.email}`);
    return await this.authService.requestRenewSignatures(renewDto);
  }

  @Post('confirm-renew-signatures')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Confirm signature renewal',
    description:
      'Confirm signature renewal with verification code and new password',
  })
  @ApiBody({
    type: ConfirmRenewSignaturesDto,
    description: 'Verification code and new password for signature renewal',
    examples: {
      'confirm-renew-signatures': {
        summary: 'Confirm signature renewal',
        description: 'Confirm renewal with verification code and new password',
        value: {
          email: 'user@example.com',
          verificationCode: '123456',
          newPassword: 'NewSecurePassword123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Signatures renewed successfully - all tokens invalidated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
    schema: {
      example: {
        message: [
          'verificationCode must be longer than or equal to 6 characters',
          'newPassword must be longer than or equal to 8 characters',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired verification code',
    schema: {
      example: {
        message: 'Invalid verification code',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async confirmRenewSignatures(
    @Body() confirmDto: ConfirmRenewSignaturesDto,
  ): Promise<void> {
    this.logger.log(
      `Signature renewal confirmation for email: ${confirmDto.email}`,
    );
    return await this.authService.confirmRenewSignatures(confirmDto);
  }

  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Introspect access token',
    description:
      'Validate and return information about the provided access token',
  })
  @ApiBody({
    type: IntrospectTokenDto,
    description: 'Token to introspect',
    examples: {
      'introspect-token': {
        summary: 'Token introspection',
        description: 'Inspect a JWT token',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token introspection result',
    type: TokenIntrospectResponseDto,
    schema: {
      example: {
        active: true,
        sub: 'cmg32kf5z0000d55o3gox11za',
        iss: 'flucastr-auth-service',
        aud: 'flucastr-services',
        exp: 1638360000,
        iat: 1638273600,
        email: 'user@example.com',
        roles: ['user'],
        token_type: 'access',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token format',
    schema: {
      example: {
        active: false,
        error: 'Invalid token format',
      },
    },
  })
  async introspectToken(
    @Body() introspectDto: IntrospectTokenDto,
  ): Promise<TokenIntrospectResponseDto> {
    this.logger.log('Token introspection request');
    return await this.authService.introspectToken(introspectDto.token);
  }

  @Post('admin/revoke-user-tokens')
  @UseGuards(JwtGuard, RbacGuard)
  @RequireAdmin()
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Admin revoke user tokens',
    description:
      'Administrative endpoint to revoke all tokens for a specific user (requires admin role)',
  })
  @ApiBody({
    type: AdminRevokeUserTokensDto,
    description: 'User ID whose tokens will be revoked',
    examples: {
      'admin-revoke-tokens': {
        summary: 'Admin token revocation',
        description: 'Request to revoke all tokens for a specific user',
        value: {
          userId: 'cmg32kf5z0000d55o3gox11za',
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'User tokens revoked successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - admin role required',
    schema: {
      example: {
        message: 'Insufficient permissions. Required roles: admin',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        message: 'User not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  async adminRevokeUserTokens(
    @Body() adminRevokeDto: AdminRevokeUserTokensDto,
  ): Promise<void> {
    this.logger.log(
      `Admin token revocation request for user: ${adminRevokeDto.userId}`,
    );
    return await this.authService.adminRevokeUserTokens(adminRevokeDto);
  }
}
