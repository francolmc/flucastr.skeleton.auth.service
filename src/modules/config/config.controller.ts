import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppConfigUtils } from '../../config/app.config';

@ApiTags('Configuration')
@Controller('config')
export class ConfigController {
  @Get('verify')
  @ApiOperation({
    summary: 'Verify configuration status',
    description: 'Returns current configuration status and applied settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration status',
    schema: {
      example: {
        environment: 'development',
        cors: {
          enabled: true,
          origins: ['http://localhost:3000'],
        },
        security: {
          helmet: { enabled: false },
          rateLimit: { enabled: false },
        },
        features: {
          swagger: true,
          jwt: true,
        },
      },
    },
  })
  getConfigStatus() {
    const corsConfig = AppConfigUtils.getCorsConfig();
    const securityConfig = AppConfigUtils.getSecurityConfig();
    const envInfo = AppConfigUtils.getEnvironmentInfo();

    return {
      timestamp: new Date().toISOString(),
      environment: envInfo.environment,
      version: envInfo.version,
      port: AppConfigUtils.getPort(),
      globalPrefix: AppConfigUtils.getGlobalPrefix(),
      cors: {
        enabled: AppConfigUtils.isCorsEnabled(),
        origins: corsConfig.origin,
        methods: corsConfig.methods,
        credentials: corsConfig.credentials,
        maxAge: corsConfig.maxAge,
      },
      security: {
        helmet: {
          enabled: securityConfig.helmet.enabled,
          features: securityConfig.helmet.enabled
            ? {
                contentSecurityPolicy:
                  securityConfig.helmet.contentSecurityPolicy,
                crossOriginEmbedderPolicy:
                  securityConfig.helmet.crossOriginEmbedderPolicy,
                hsts: securityConfig.helmet.hsts,
                frameguard: securityConfig.helmet.frameguard,
                hidePoweredBy: securityConfig.helmet.hidePoweredBy,
              }
            : null,
        },
        rateLimit: {
          enabled: securityConfig.rateLimit.enabled,
          config: securityConfig.rateLimit.enabled
            ? {
                windowMs: securityConfig.rateLimit.windowMs,
                max: securityConfig.rateLimit.max,
                message: securityConfig.rateLimit.message,
              }
            : null,
        },
      },
      features: {
        swagger: AppConfigUtils.isFeatureEnabled('SWAGGER'),
        jwt: AppConfigUtils.isFeatureEnabled('JWT'),
        logging: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
      },
      validation: AppConfigUtils.getValidationPipeOptions(),
      environmentVariables: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        corsEnabled: process.env.CORS_ENABLED,
        corsOrigin: process.env.CORS_ORIGIN,
        swaggerEnabled: process.env.SWAGGER_ENABLED,
        jwtEnabled: process.env.JWT_ENABLED,
        helmetEnabled: process.env.HELMET_ENABLED,
        rateLimitEnabled: process.env.RATE_LIMIT_ENABLED,
      },
    };
  }

  @Get('headers')
  @ApiOperation({
    summary: 'Test response headers',
    description: 'Returns a simple response to test security headers',
  })
  @ApiResponse({
    status: 200,
    description: 'Simple response for header testing',
  })
  testHeaders() {
    return {
      message: 'Check response headers to verify security configuration',
      timestamp: new Date().toISOString(),
      tip: 'Use browser dev tools or curl -I to inspect headers',
    };
  }
}
