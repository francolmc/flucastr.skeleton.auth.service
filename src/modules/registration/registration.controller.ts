// registration.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import {
  RegisterUserDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RegistrationResponseDto,
  UpdateUserDto,
} from './dtos';
import { ValidCuidParam } from '../../shared/decorators/validation.decorators';

@Controller('registration')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  /**
   * Transform UserEntity to RegistrationResponseDto
   */
  private transformToResponse(user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): RegistrationResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Register a new user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sends a verification email. The user will need to verify their email before they can log in.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: RegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists',
  })
  @ApiConflictResponse({
    description: 'Email address already registered',
  })
  async register(
    @Body() registerDto: RegisterUserDto,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.register(registerDto);
    return this.transformToResponse(user);
  }

  /**
   * Verify user email with token
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify user email',
    description:
      'Verifies the user email using the token sent to their email address.',
  })
  @ApiOkResponse({
    description: 'Email successfully verified',
    type: RegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification token',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async verifyEmail(
    @Body() verifyDto: VerifyEmailDto,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.verifyEmail(verifyDto);
    return this.transformToResponse(user);
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend verification email',
    description:
      "Resends the verification email to a user who hasn't verified their account yet.",
  })
  @ApiOkResponse({
    description: 'Verification email sent successfully',
    type: RegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Email already verified or invalid input',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async resendVerification(
    @Body() resendDto: ResendVerificationDto,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.resendVerification(resendDto);
    return this.transformToResponse(user);
  }

  /**
   * Get user by ID (for admin purposes)
   */
  @Get('users/:id')
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieves user information by their unique identifier. Admin endpoint.',
  })
  @ApiOkResponse({
    description: 'User found',
    type: RegistrationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (CUID format)',
    type: String,
    example: 'cm1abc123def456ghi789jklm',
  })
  async getUserById(
    @ValidCuidParam('id') id: string,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.getUserById(id);
    return this.transformToResponse(user);
  }

  /**
   * Get user by email (for admin purposes)
   */
  @Get('users/email/:email')
  @ApiOperation({
    summary: 'Get user by email',
    description:
      'Retrieves user information by their email address. Admin endpoint.',
  })
  @ApiOkResponse({
    description: 'User found',
    type: RegistrationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    type: String,
    example: 'john.doe@example.com',
  })
  async getUserByEmail(
    @Param('email') email: string,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.getUserByEmail(email);
    return this.transformToResponse(user);
  }

  /**
   * Update user profile (for admin purposes)
   */
  @Put('users/:id')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates user profile information. Admin endpoint.',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: RegistrationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (CUID format)',
    type: String,
    example: 'cm1abc123def456ghi789jklm',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User profile data to update',
    examples: {
      updateProfile: {
        summary: 'Update user profile',
        description: 'Example of updating user profile information',
        value: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
        },
      },
      updatePassword: {
        summary: 'Update password',
        description: 'Example of updating user password',
        value: {
          password: 'newSecurePassword123',
        },
      },
    },
  })
  async updateUser(
    @ValidCuidParam('id') id: string,
    @Body() updates: UpdateUserDto,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.updateUser(id, updates);
    return this.transformToResponse(user);
  }

  /**
   * Soft delete user (deactivate)
   */
  @Delete('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate user account',
    description:
      'Soft deletes a user account by setting isActive to false. Admin endpoint.',
  })
  @ApiOkResponse({
    description: 'User deactivated successfully',
    type: RegistrationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (CUID format)',
    type: String,
    example: 'cm1abc123def456ghi789jklm',
  })
  async deactivateUser(
    @ValidCuidParam('id') id: string,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.deactivateUser(id);
    return this.transformToResponse(user);
  }

  /**
   * Restore user (reactivate)
   */
  @Put('users/:id/restore')
  @ApiOperation({
    summary: 'Reactivate user account',
    description:
      'Restores a deactivated user account by setting isActive to true. Admin endpoint.',
  })
  @ApiOkResponse({
    description: 'User reactivated successfully',
    type: RegistrationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (CUID format)',
    type: String,
    example: 'cm1abc123def456ghi789jklm',
  })
  async restoreUser(
    @ValidCuidParam('id') id: string,
  ): Promise<RegistrationResponseDto> {
    const user = await this.registrationService.reactivateUser(id);
    return this.transformToResponse(user);
  }

  /**
   * Hard delete user (dangerous operation - admin only)
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Permanently delete user',
    description:
      'Permanently deletes a user from the database. This operation cannot be undone. Admin only.',
  })
  @ApiOkResponse({
    description: 'User permanently deleted',
    schema: {
      type: 'object',
      properties: {
        deleted: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (CUID format)',
    type: String,
    example: 'cm1abc123def456ghi789jklm',
  })
  async deleteUser(
    @ValidCuidParam('id') id: string,
  ): Promise<{ deleted: boolean }> {
    const deleted = await this.registrationService.deleteUser(id);
    return { deleted };
  }

  /**
   * Check if email exists
   */
  @Get('check-email/:email')
  @ApiOperation({
    summary: 'Check if email exists',
    description:
      'Checks if an email address is already registered in the system.',
  })
  @ApiOkResponse({
    description: 'Email availability checked',
    schema: {
      type: 'object',
      properties: {
        exists: {
          type: 'boolean',
          example: false,
        },
      },
    },
  })
  @ApiParam({
    name: 'email',
    description: 'Email address to check',
    type: String,
    example: 'john.doe@example.com',
  })
  async checkEmailExists(
    @Param('email') email: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.registrationService.emailExists(email);
    return { exists };
  }
}
