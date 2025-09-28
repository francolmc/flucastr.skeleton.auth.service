// shared/decorators/validation.decorators.ts
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsString,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

/**
 * CUID validation regex
 * CUID format: starts with 'c', followed by 24 alphanumeric characters
 * Example: cm1abc123def456ghi789jklm
 */
const CUID_REGEX = /^c[a-z0-9]{24}$/;

/**
 * Validates that a string is a valid CUID (Prisma's default ID format)
 */
export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      target: object.constructor as any,
      propertyName: propertyName,
      options: {
        message: 'ID must be a valid CUID format',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && CUID_REGEX.test(value);
        },
      },
    });
  };
}

/**
 * Validates and transforms CUID parameter from URL
 */
export const ValidCuidParam = createParamDecorator(
  (paramName: string, ctx: ExecutionContext): string => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const paramValue = request.params[paramName] as string;

    if (!paramValue) {
      throw new BadRequestException(`Parameter ${paramName} is required`);
    }

    if (typeof paramValue !== 'string' || !CUID_REGEX.test(paramValue)) {
      throw new BadRequestException(
        `Parameter ${paramName} must be a valid CUID format`,
      );
    }

    return paramValue;
  },
);

/**
 * DTO decorator for CUID validation
 */
export function ValidCuid(validationOptions?: ValidationOptions) {
  return function (target: Record<string, any>, propertyName: string) {
    // Apply string validation
    IsString(validationOptions)(target, propertyName);
    // Apply CUID format validation
    IsCuid(validationOptions)(target, propertyName);
    // Apply trim transformation
    Transform(({ value }: { value: any }) =>
      typeof value === 'string' ? value.trim() : (value as string),
    )(target, propertyName);
  };
}
