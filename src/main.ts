import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import {
  createWinstonConfig,
  createSwaggerDocumentBuilder,
  createSwaggerDocumentOptions,
  createSwaggerUIOptions,
  SwaggerUtils,
  AppConfigUtils,
  EnvValidationUtils,
  SecurityConfigUtils,
  AppConfigVerificationUtils,
} from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonConfig()),
  });

  // Set global prefix
  const globalPrefix = AppConfigUtils.getGlobalPrefix();
  app.setGlobalPrefix(globalPrefix);

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable CORS
  if (AppConfigUtils.isCorsEnabled()) {
    const corsConfig = AppConfigUtils.getCorsConfig();
    app.enableCors(corsConfig);
    console.log('🌐 CORS enabled with config:', {
      origin: corsConfig.origin,
      methods: corsConfig.methods,
      credentials: corsConfig.credentials,
    });
  }

  // Apply security configurations
  SecurityConfigUtils.applyHelmetConfig(app);
  SecurityConfigUtils.applyGlobalValidation(app);

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger configuration
  if (SwaggerUtils.isEnabled()) {
    const swaggerBuilder = createSwaggerDocumentBuilder();
    const swaggerConfig = swaggerBuilder.build();
    const swaggerOptions = createSwaggerDocumentOptions();
    const uiOptions = createSwaggerUIOptions();

    const document = SwaggerModule.createDocument(
      app,
      swaggerConfig,
      swaggerOptions,
    );

    const swaggerPath = process.env.SWAGGER_PATH || 'api';

    SwaggerModule.setup(swaggerPath, app, document, uiOptions);
  }

  const port = AppConfigUtils.getPort();
  await app.listen(port);
  const baseUrl = await app.getUrl();

  const envInfo = AppConfigUtils.getEnvironmentInfo();

  console.log(`🚀 ${envInfo.name} is running on: ${baseUrl}`);
  console.log(`📡 Global prefix: /${globalPrefix}`);

  if (SwaggerUtils.isEnabled()) {
    const swaggerPath = process.env.SWAGGER_PATH || 'api';
    console.log(`📚 Swagger is running on: ${baseUrl}/${swaggerPath}`);
  }

  console.log(`🔧 Environment: ${envInfo.environment}`);
  console.log(`📦 Version: ${envInfo.version}`);

  // Environment validation report (only in development)
  if (AppConfigUtils.isDevelopment()) {
    const missingVars = EnvValidationUtils.checkRequiredVariables();
    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing required variables: ${missingVars.join(', ')}`);
    }
  }

  // Generate configuration reports
  SecurityConfigUtils.generateSecurityReport();
  AppConfigVerificationUtils.verifyConfiguration();

  console.log(`⚡ ${envInfo.name} v${envInfo.version} ready!\n`);
}
bootstrap().catch((err) => {
  console.error('🐛 Error during application bootstrap:', err);
  process.exit(1);
});
