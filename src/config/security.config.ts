import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppConfigUtils } from './app.config';

/**
 * Utilidades para aplicar y verificar configuraciones de seguridad
 */
export class SecurityConfigUtils {
  private static readonly logger = new Logger(SecurityConfigUtils.name);

  /**
   * Aplica configuración global de validación
   */
  static applyGlobalValidation(app: INestApplication): void {
    const validationOptions = AppConfigUtils.getValidationPipeOptions();

    app.useGlobalPipes(new ValidationPipe(validationOptions));

    this.logger.log('✅ Global validation pipe configured');
    this.logger.debug('Validation options:', validationOptions);
  }

  /**
   * Aplica configuración de Helmet (si está disponible)
   */
  static applyHelmetConfig(app: INestApplication): void {
    const config = AppConfigUtils.getSecurityConfig();

    if (config.helmet.enabled) {
      try {
        // Apply basic security headers
        app.use(
          helmet({
            hidePoweredBy: true,
            noSniff: true,
            xssFilter: true,
            frameguard: true,
          }),
        );

        this.logger.log('🛡️ Helmet security middleware enabled');
      } catch {
        this.logger.warn(
          '⚠️ Helmet not available. Install with: npm install helmet',
        );
        this.logger.warn('⚠️ Helmet security middleware disabled');
      }
    } else {
      this.logger.log(
        'ℹ️ Helmet security middleware disabled in configuration',
      );
    }
  }

  /**
   * Genera reporte de configuración de seguridad aplicada
   */
  static generateSecurityReport(): void {
    const config = AppConfigUtils.getSecurityConfig();
    const corsConfig = AppConfigUtils.getCorsConfig();
    const corsEnabled = AppConfigUtils.isCorsEnabled();

    console.log('\n🛡️ Security Configuration Report');
    console.log('=====================================\n');

    // Helmet
    console.log('🪖 Helmet Security:');
    console.log(
      `  Status: ${config.helmet.enabled ? '✅ Enabled' : '❌ Disabled'}`,
    );
    if (config.helmet.enabled) {
      console.log(
        `  CSP: ${config.helmet.contentSecurityPolicy ? '✅' : '❌'}`,
      );
      console.log(
        `  COEP: ${config.helmet.crossOriginEmbedderPolicy ? '✅' : '❌'}`,
      );
      console.log(
        `  COOP: ${config.helmet.crossOriginOpenerPolicy ? '✅' : '❌'}`,
      );
      console.log(
        `  CORP: ${config.helmet.crossOriginResourcePolicy ? '✅' : '❌'}`,
      );
      console.log(`  HSTS: ${config.helmet.hsts ? '✅' : '❌'}`);
      console.log(
        `  X-Frame-Options: ${config.helmet.frameguard ? '✅' : '❌'}`,
      );
      console.log(
        `  Hide X-Powered-By: ${config.helmet.hidePoweredBy ? '✅' : '❌'}`,
      );
    }

    // CORS
    console.log('\n🌐 CORS Configuration:');
    console.log(`  Status: ${corsEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    if (corsEnabled) {
      console.log(
        `  Origins: ${Array.isArray(corsConfig.origin) ? corsConfig.origin.join(', ') : corsConfig.origin}`,
      );
      console.log(`  Methods: ${corsConfig.methods.join(', ')}`);
      console.log(`  Credentials: ${corsConfig.credentials ? '✅' : '❌'}`);
      console.log(`  Max Age: ${corsConfig.maxAge}s`);
    }

    // Rate Limiting
    console.log('\n🚦 Rate Limiting:');
    console.log(
      `  Status: ${config.rateLimit.enabled ? '✅ Enabled' : '❌ Disabled'}`,
    );
    if (config.rateLimit.enabled) {
      console.log(`  Window: ${config.rateLimit.windowMs / 1000}s`);
      console.log(`  Max Requests: ${config.rateLimit.max}`);
      console.log(`  Message: "${config.rateLimit.message}"`);
    }

    console.log('\n');
  }
}

/**
 * Utilidades para verificar configuración de aplicación
 */
export class AppConfigVerificationUtils {
  private static readonly logger = new Logger(AppConfigVerificationUtils.name);

  /**
   * Verifica que todas las configuraciones críticas estén aplicadas
   */
  static verifyConfiguration(): void {
    console.log('\n🔍 Configuration Verification Report');
    console.log('====================================\n');

    // Verificar variables de entorno críticas
    this.verifyEnvironmentVariables();

    // Verificar configuración de aplicación
    this.verifyAppConfiguration();

    // Verificar configuración de seguridad
    this.verifySecurityConfiguration();

    console.log('\n');
  }

  private static verifyEnvironmentVariables(): void {
    console.log('📋 Environment Variables:');

    const criticalVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_ISSUER',
      'JWT_AUDIENCE',
    ];

    const optionalVars = [
      'CORS_ENABLED',
      'SWAGGER_ENABLED',
      'HELMET_ENABLED',
      'RATE_LIMIT_ENABLED',
    ];

    criticalVars.forEach((varName) => {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      console.log(
        `  ${varName}: ${status} ${value ? `(${this.maskSensitive(varName, value)})` : '(missing)'}`,
      );
    });

    console.log('\n📋 Optional Variables:');
    optionalVars.forEach((varName) => {
      const value = process.env[varName];
      const status = value ? '✅' : '⚠️';
      console.log(`  ${varName}: ${status} ${value || '(using default)'}`);
    });
  }

  private static verifyAppConfiguration(): void {
    console.log('\n⚙️ Application Configuration:');

    const envInfo = AppConfigUtils.getEnvironmentInfo();
    console.log(`  Environment: ${envInfo.environment}`);
    console.log(`  Port: ${AppConfigUtils.getPort()}`);
    console.log(`  Global Prefix: /${AppConfigUtils.getGlobalPrefix()}`);
    console.log(`  Base URL: ${AppConfigUtils.getBaseUrl()}`);

    // Verificar Swagger
    const swaggerEnabled = AppConfigUtils.isFeatureEnabled('SWAGGER');
    console.log(`  Swagger: ${swaggerEnabled ? '✅ Enabled' : '❌ Disabled'}`);

    // Verificar JWT
    const jwtEnabled = AppConfigUtils.isFeatureEnabled('JWT');
    console.log(`  JWT: ${jwtEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  private static verifySecurityConfiguration(): void {
    console.log('\n🔒 Security Configuration:');

    const corsEnabled = AppConfigUtils.isCorsEnabled();
    console.log(`  CORS: ${corsEnabled ? '✅ Enabled' : '❌ Disabled'}`);

    const helmetEnabled = AppConfigUtils.isFeatureEnabled('HELMET');
    console.log(`  Helmet: ${helmetEnabled ? '✅ Enabled' : '❌ Disabled'}`);

    const rateLimitEnabled = AppConfigUtils.isFeatureEnabled('RATE_LIMIT');
    console.log(
      `  Rate Limiting: ${rateLimitEnabled ? '✅ Enabled' : '❌ Disabled'}`,
    );

    // Verificar configuración de validación
    const validationOptions = AppConfigUtils.getValidationPipeOptions();
    console.log(`  Global Validation: ✅ Enabled`);
    console.log(`    Whitelist: ${validationOptions.whitelist ? '✅' : '❌'}`);
    console.log(`    Transform: ${validationOptions.transform ? '✅' : '❌'}`);
    console.log(
      `    Forbid Non-Whitelisted: ${validationOptions.forbidNonWhitelisted ? '✅' : '❌'}`,
    );
  }

  private static maskSensitive(key: string, value: string): string {
    const sensitiveKeys = ['SECRET', 'PASSWORD', 'KEY', 'TOKEN'];

    if (
      sensitiveKeys.some((sensitive) => key.toUpperCase().includes(sensitive))
    ) {
      return value.length > 8
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '***';
    }

    return value;
  }
}
