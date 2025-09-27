# 📚 Guía Completa para Implementar un Módulo en Flucastr Services

## 📋 Tabla de Contenidos

1. [Validación de Módulos Existentes](#validación-de-módulos-existentes)
2. [Estructura Recomendada de Módulo](#estructura-recomendada-de-módulo)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Ejemplos Completos](#ejemplos-completos)
5. [Buenas Prácticas Validadas](#buenas-prácticas-validadas)

---

## ✅ Validación de Módulos Existentes

### Comparativa de Estructuras

| Aspecto | Guía de Desarrollo | Módulo Tasks | Módulo Registration | Estado |
|---------|-------------------|--------------|-------------------|---------|
| **Arquivos Principales** | ✅ controller, service, repository, module | ✅ Implementados | ✅ Implementados | ✅ Compatible |
| **DTOs** | ✅ create, update, response | ✅ Completos | ✅ Completos | ✅ Compatible |
| **Entidades** | ✅ entity, types, interfaces | ✅ Completos | ✅ Completos | ✅ Compatible |
| **Estructura de Directorios** | ✅ dto/, entities/, interfaces/ | ✅ Implementada | ✅ Implementada | ✅ Compatible |
| **Separación de Concerns** | ✅ Patrón Repository/Service | ✅ Implementado | ✅ Implementado | ✅ Compatible |
| **Validación de DTOs** | ✅ class-validator + swagger | ✅ Implementado | ✅ Implementado | ✅ Compatible |
| **Manejo de Errores** | ✅ Logger + excepciones específicas | ✅ Implementado | ✅ Implementado | ✅ Compatible |
| **Documentación API** | ✅ Swagger decorators | ✅ Implementado | ✅ Implementado | ✅ Compatible |

### ✅ **Resultado de Validación: AMBOS MÓDULOS CUMPLEN CON LAS GUÍAS**

Los módulos `registration` y `tasks` implementan correctamente todas las mejores prácticas definidas en la guía de desarrollo de Flucastr.

---

## 🏗️ Estructura Recomendada de Módulo

### Estructura Estándar (Guía Original)

```
src/modules/[module-name]/
├── 📄 [module-name].module.ts       # Definición del módulo
├── 📄 [module-name].controller.ts   # Endpoints REST
├── 📄 [module-name].service.ts      # Lógica de negocio
├── 📄 [module-name].repository.ts   # Acceso a datos
├── 📁 dto/                         # Data Transfer Objects
│   ├── 📄 create-[entity].dto.ts
│   ├── 📄 update-[entity].dto.ts
│   └── 📄 [entity].response.dto.ts
├── 📁 entities/                    # Definiciones de entidades
│   ├── 📄 [entity].entity.ts
│   ├── 📄 types.ts                 # Enums y tipos
│   └── 📄 index.ts                 # Exportaciones
└── 📁 interfaces/                  # Interfaces TypeScript
    ├── 📄 [module-name].interface.ts
    └── 📄 index.ts
```

### Estructura Extendida (Implementada en Registration)

```
src/modules/[module-name]/
├── 📄 [module-name].module.ts           # Definición del módulo
├── 📁 controllers/                      # Controladores REST
│   ├── 📄 [module-name].controller.ts
│   └── 📄 index.ts
├── 📁 services/                         # Servicios de negocio
│   ├── 📄 [module-name].service.ts
│   └── 📄 index.ts
├── 📁 repository/                       # Repositorios de datos
│   ├── 📄 [module-name].repository.ts
│   └── 📄 index.ts
├── 📁 dto/                             # Data Transfer Objects
│   ├── 📄 create-[entity].dto.ts
│   ├── 📄 update-[entity].dto.ts
│   ├── 📄 [entity].response.dto.ts
│   └── 📄 index.ts
├── 📁 entities/                        # Definiciones de entidades
│   ├── 📄 [entity].entity.ts
│   ├── 📄 types.ts
│   └── 📄 index.ts
└── 📁 interfaces/                      # Interfaces TypeScript
    ├── 📄 [module-name].interface.ts
    └── 📄 index.ts
```

---

## 🚀 Implementación Paso a Paso

### Paso 1: Preparación del Entorno

```bash
# Crear estructura de directorios
mkdir -p src/modules/[module-name]/{controllers,services,repository,dto,entities,interfaces}

# Crear archivos base
touch src/modules/[module-name]/[module-name].module.ts
touch src/modules/[module-name]/controllers/[module-name].controller.ts
touch src/modules/[module-name]/services/[module-name].service.ts
touch src/modules/[module-name]/repository/[module-name].repository.ts

# Crear archivos de índice
touch src/modules/[module-name]/{controllers,services,repository,dto,entities,interfaces}/index.ts
```

### Paso 2: Definir el Modelo Prisma

```prisma
// prisma/schema.prisma
model [Entity] {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  status    [Entity]Status @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  // relatedEntities RelatedEntity[]

  @@map("[entities]")
}

enum [Entity]Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### Paso 3: Crear Interfaces Base

```typescript
// interfaces/[module-name].interface.ts
export interface [Entity]Filters {
  status?: [Entity]Status;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface [Entity]Metrics {
  total: number;
  active: number;
  inactive: number;
  createdToday: number;
}

export interface [Entity]Response {
  id: string;
  name: string;
  email: string;
  status: [Entity]Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface [ModuleName]ServiceInterface {
  findAll(options?: PaginationOptions): Promise<[Entity]Response[]>;
  findById(id: string): Promise<[Entity]Response>;
  create(data: Create[Entity]Dto): Promise<[Entity]Response>;
  update(id: string, data: Update[Entity]Dto): Promise<[Entity]Response>;
  delete(id: string): Promise<void>;
  getMetrics(): Promise<[Entity]Metrics>;
}

export interface [ModuleName]RepositoryInterface {
  findAll(options?: PaginationOptions): Promise<[Entity][]>;
  findById(id: string): Promise<[Entity] | null>;
  create(data: Create[Entity]Data): Promise<[Entity]>;
  update(id: string, data: Update[Entity]Data): Promise<[Entity]>;
  delete(id: string): Promise<void>;
  count(filters?: [Entity]Filters): Promise<number>;
}
```

### Paso 4: Crear Tipos y Entidades

```typescript
// entities/types.ts
export enum [Entity]Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export const [ENTITY]_STATUS_VALUES = Object.values([Entity]Status);

export interface [Entity]Filters {
  status?: [Entity]Status;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface [Entity]Metrics {
  total: number;
  active: number;
  inactive: number;
  createdToday: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Create[Entity]Data {
  name: string;
  email: string;
  // otros campos requeridos
}

export interface Update[Entity]Data {
  name?: string;
  email?: string;
  status?: [Entity]Status;
  // otros campos opcionales
}
```

```typescript
// entities/[entity].entity.ts
import { [Entity]Status } from './types';

export class [Entity] {
  id: string;
  name: string;
  email: string;
  status: [Entity]Status;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<[Entity]>) {
    Object.assign(this, partial);
  }

  isActive(): boolean {
    return this.status === [Entity]Status.ACTIVE;
  }

  getDisplayName(): string {
    return this.name;
  }
}
```

### Paso 5: Crear DTOs

```typescript
// dto/create-[entity].dto.ts
import { IsString, IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Create[Entity]Dto {
  @ApiProperty({
    description: 'Nombre del [entidad]',
    example: 'Juan Pérez',
  })
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Email del [entidad]',
    example: 'juan@example.com',
  })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
```

```typescript
// dto/update-[entity].dto.ts
import { IsString, IsEmail, IsOptional, IsEnum, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { [Entity]Status } from '../entities';

export class Update[Entity]Dto {
  @ApiPropertyOptional({
    description: 'Nombre del [entidad]',
    example: 'Juan Pérez Actualizado',
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Email del [entidad]',
    example: 'juan.nuevo@example.com',
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Estado del [entidad]',
    enum: [Entity]Status,
    example: [Entity]Status.ACTIVE,
  })
  @IsOptional()
  @IsEnum([Entity]Status)
  status?: [Entity]Status;
}
```

```typescript
// dto/[entity].response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { [Entity]Status } from '../entities';

export class [Entity]ResponseDto {
  @ApiProperty({
    description: 'Identificador único del [entidad]',
    example: '[entity]-123',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del [entidad]',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Email del [entidad]',
    example: 'juan@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Estado del [entidad]',
    enum: [Entity]Status,
    example: [Entity]Status.ACTIVE,
  })
  status: [Entity]Status;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T14:45:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<[Entity]ResponseDto>) {
    Object.assign(this, partial);
  }
}
```

### Paso 6: Crear Repositorio

```typescript
// repository/[module-name].repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { [ModuleName]RepositoryInterface } from '../interfaces';
import { [Entity] } from '../entities';
import { Create[Entity]Data, Update[Entity]Data, [Entity]Filters, PaginationOptions } from '../entities/types';

@Injectable()
export class [ModuleName]Repository implements [ModuleName]RepositoryInterface {
  private readonly logger = new Logger([ModuleName]Repository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(options?: PaginationOptions): Promise<[Entity][]> {
    this.logger.log('Finding all [entities]');

    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options || {};

      const skip = (page - 1) * limit;

      const entities = await this.databaseService.[entity].findMany({
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      this.logger.log(`Found ${entities.length} [entities]`);
      return entities.map(entity => this.mapTo[Entity](entity));
    } catch (error) {
      this.logger.error('Error finding all [entities]:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<[Entity] | null> {
    this.logger.log(`Finding [entity] by ID: ${id}`);

    try {
      const entity = await this.databaseService.[entity].findUnique({
        where: { id },
      });

      if (!entity) {
        this.logger.warn(`[Entity] with ID ${id} not found`);
        return null;
      }

      this.logger.log(`[Entity] found: ${entity.name}`);
      return this.mapTo[Entity](entity);
    } catch (error) {
      this.logger.error(`Error finding [entity] ${id}:`, error);
      throw error;
    }
  }

  async create(data: Create[Entity]Data): Promise<[Entity]> {
    this.logger.log(`Creating [entity]: ${JSON.stringify(data)}`);

    try {
      const entity = await this.databaseService.[entity].create({
        data: {
          ...data,
          status: [Entity]Status.ACTIVE,
        },
      });

      this.logger.log(`[Entity] created successfully: ${entity.id} - ${entity.name}`);
      return this.mapTo[Entity](entity);
    } catch (error) {
      this.logger.error('Error creating [entity]:', {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async update(id: string, data: Update[Entity]Data): Promise<[Entity]> {
    this.logger.log(`Updating [entity] ${id}: ${JSON.stringify(data)}`);

    try {
      const existingEntity = await this.findById(id);
      if (!existingEntity) {
        throw new NotFoundException(`[Entity] with ID ${id} not found`);
      }

      const updatedEntity = await this.databaseService.[entity].update({
        where: { id },
        data,
      });

      this.logger.log(`[Entity] updated successfully: ${updatedEntity.id} - ${updatedEntity.name}`);
      return this.mapTo[Entity](updatedEntity);
    } catch (error) {
      this.logger.error(`Error updating [entity] ${id}:`, {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting [entity]: ${id}`);

    try {
      const existingEntity = await this.findById(id);
      if (!existingEntity) {
        throw new NotFoundException(`[Entity] with ID ${id} not found`);
      }

      await this.databaseService.[entity].delete({
        where: { id },
      });

      this.logger.log(`[Entity] deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting [entity] ${id}:`, error);
      throw error;
    }
  }

  async count(filters?: [Entity]Filters): Promise<number> {
    this.logger.log('Counting [entities]');

    try {
      const whereClause = filters ? this.buildWhereClause(filters) : {};

      const count = await this.databaseService.[entity].count({
        where: whereClause,
      });

      this.logger.log(`Total [entities] count: ${count}`);
      return count;
    } catch (error) {
      this.logger.error('Error counting [entities]:', error);
      throw error;
    }
  }

  private buildWhereClause(filters: [Entity]Filters) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private mapTo[Entity](entity: any): [Entity] {
    return new [Entity]({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
```

### Paso 7: Crear Servicio

```typescript
// services/[module-name].service.ts
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { [ModuleName]Repository } from '../repository';
import { [ModuleName]ServiceInterface } from '../interfaces';
import { [Entity]Response } from '../interfaces';
import { Create[Entity]Dto, Update[Entity]Dto, [Entity]ResponseDto } from '../dto';
import { [Entity]Status, [Entity]Filters, [Entity]Metrics, PaginationOptions } from '../entities/types';

@Injectable()
export class [ModuleName]Service implements [ModuleName]ServiceInterface {
  private readonly logger = new Logger([ModuleName]Service.name);

  constructor(private readonly [moduleName]Repository: [ModuleName]Repository) {}

  async findAll(options?: PaginationOptions): Promise<[Entity]Response[]> {
    this.logger.log('Finding all [entities]');

    try {
      const entities = await this.[moduleName]Repository.findAll(options);
      this.logger.log(`Retrieved ${entities.length} [entities]`);
      return entities.map(entity => this.mapToResponse(entity));
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<[Entity]Response> {
    this.logger.log(`Finding [entity] by ID: ${id}`);

    if (!id) {
      throw new NotFoundException('[Entity] ID is required');
    }

    try {
      const entity = await this.[moduleName]Repository.findById(id);
      if (!entity) {
        throw new NotFoundException(`[Entity] with ID ${id} not found`);
      }

      this.logger.log(`[Entity] found: ${entity.name}`);
      return this.mapToResponse(entity);
    } catch (error) {
      this.logger.error(`Error finding [entity] ${id}:`, error);
      throw error;
    }
  }

  async create(data: Create[Entity]Dto): Promise<[Entity]Response> {
    this.logger.log(`Creating new [entity]: ${JSON.stringify(data)}`);

    try {
      // Verificar si ya existe un [entity] con el mismo email
      // const existing = await this.[moduleName]Repository.findByEmail(data.email);
      // if (existing) {
      //   throw new ConflictException('Email already exists');
      // }

      const entity = await this.[moduleName]Repository.create(data);
      this.logger.log(`[Entity] created successfully: ${entity.id}`);
      return this.mapToResponse(entity);
    } catch (error) {
      this.logger.error('Error creating [entity]:', {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async update(id: string, data: Update[Entity]Dto): Promise<[Entity]Response> {
    this.logger.log(`Updating [entity] ${id}: ${JSON.stringify(data)}`);

    try {
      const updatedEntity = await this.[moduleName]Repository.update(id, data);
      this.logger.log(`[Entity] updated successfully: ${updatedEntity.id}`);
      return this.mapToResponse(updatedEntity);
    } catch (error) {
      this.logger.error(`Error updating [entity] ${id}:`, {
        data,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting [entity]: ${id}`);

    try {
      await this.[moduleName]Repository.delete(id);
      this.logger.log(`[Entity] deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting [entity] ${id}:`, error);
      throw error;
    }
  }

  async getMetrics(): Promise<[Entity]Metrics> {
    this.logger.log('Getting [entity] metrics');

    try {
      const [total, active, inactive, createdToday] = await Promise.all([
        this.[moduleName]Repository.count(),
        this.[moduleName]Repository.count({ status: [Entity]Status.ACTIVE }),
        this.[moduleName]Repository.count({ status: [Entity]Status.INACTIVE }),
        this.[moduleName]Repository.count({
          startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        }),
      ]);

      const metrics: [Entity]Metrics = {
        total,
        active,
        inactive,
        createdToday,
      };

      this.logger.log(`[Entity] metrics: ${JSON.stringify(metrics)}`);
      return metrics;
    } catch (error) {
      this.logger.error('Error getting [entity] metrics:', error);
      throw error;
    }
  }

  private mapToResponse(entity: [Entity]): [Entity]Response {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

### Paso 8: Crear Controlador

```typescript
// controllers/[module-name].controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { [ModuleName]Service } from '../services';
import {
  Create[Entity]Dto,
  Update[Entity]Dto,
  [Entity]ResponseDto,
} from '../dto';
import { [Entity]Status } from '../entities';

@ApiTags('[module-name]')
@Controller('[module-name]')
export class [ModuleName]Controller {
  constructor(private readonly [moduleName]Service: [ModuleName]Service) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los [entities]',
    description: 'Retorna una lista paginada de todos los [entities] del sistema',
  })
  @ApiResponse({
    status: 200,
    description: '[Entities] obtenidos exitosamente',
    type: [[Entity]ResponseDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (comenzando desde 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página (máximo 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Campo por el cual ordenar',
    enum: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Orden de clasificación',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: any,
  ): Promise<[Entity]ResponseDto[]> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const entities = await this.[moduleName]Service.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    });
    return entities.map(entity => new [Entity]ResponseDto(entity));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener [entity] por ID',
    description: 'Retorna un [entity] específico por su identificador único',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del [entity]',
    example: '[entity]-123',
  })
  @ApiResponse({
    status: 200,
    description: '[Entity] encontrado exitosamente',
    type: [Entity]ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '[Entity] no encontrado',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<[Entity]ResponseDto> {
    const entity = await this.[moduleName]Service.findById(id);
    return new [Entity]ResponseDto(entity);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo [entity]',
    description: 'Crea un nuevo [entity] en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: '[Entity] creado exitosamente',
    type: [Entity]ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  @ApiBody({
    type: Create[Entity]Dto,
    description: 'Datos del [entity] a crear',
  })
  async create(
    @Body(ValidationPipe) create[Entity]Dto: Create[Entity]Dto,
  ): Promise<[Entity]ResponseDto> {
    const entity = await this.[moduleName]Service.create(create[Entity]Dto);
    return new [Entity]ResponseDto(entity);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar [entity]',
    description: 'Actualiza un [entity] existente por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del [entity]',
    example: '[entity]-123',
  })
  @ApiResponse({
    status: 200,
    description: '[Entity] actualizado exitosamente',
    type: [Entity]ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '[Entity] no encontrado',
  })
  @ApiBody({
    type: Update[Entity]Dto,
    description: 'Datos del [entity] a actualizar',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) update[Entity]Dto: Update[Entity]Dto,
  ): Promise<[Entity]ResponseDto> {
    const entity = await this.[moduleName]Service.update(id, update[Entity]Dto);
    return new [Entity]ResponseDto(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar [entity]',
    description: 'Elimina un [entity] del sistema por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del [entity]',
    example: '[entity]-123',
  })
  @ApiResponse({
    status: 204,
    description: '[Entity] eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: '[Entity] no encontrado',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.[moduleName]Service.delete(id);
  }
}
```

### Paso 9: Crear Módulo

```typescript
// [module-name].module.ts
import { Module } from '@nestjs/common';
import { [ModuleName]Controller } from './controllers';
import { [ModuleName]Service } from './services';
import { [ModuleName]Repository } from './repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [[ModuleName]Controller],
  providers: [[ModuleName]Service, [ModuleName]Repository],
  exports: [[ModuleName]Service],
})
export class [ModuleName]Module {}
```

### Paso 10: Actualizar app.module.ts

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
// ... otros imports
import { [ModuleName]Module } from './modules/[module-name]/[module-name].module';

@Module({
  imports: [
    // ... otros módulos
    [ModuleName]Module,
  ],
  // ...
})
export class AppModule {}
```

---

## 💡 Ejemplos Completos

### Ejemplo 1: Módulo de Productos

**Estructura de archivos:**
```
src/modules/products/
├── products.module.ts
├── controllers/
│   ├── products.controller.ts
│   └── index.ts
├── services/
│   ├── products.service.ts
│   └── index.ts
├── repository/
│   ├── products.repository.ts
│   └── index.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── product.response.dto.ts
│   └── index.ts
├── entities/
│   ├── product.entity.ts
│   ├── types.ts
│   └── index.ts
└── interfaces/
    ├── products.interface.ts
    └── index.ts
```

**Modelo Prisma:**
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  category    String
  stock       Int      @default(0)
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}
```

### Ejemplo 2: Módulo de Órdenes

**DTO de creación:**
```typescript
export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 'user-123',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Lista de productos en la orden',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Dirección de envío',
    example: 'Calle Principal 123, Ciudad, País',
  })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  shippingAddress?: string;
}
```

---

## ✅ Buenas Prácticas Validadas

### 1. **Separación de Responsabilidades**
- ✅ **Repository**: Solo acceso a datos
- ✅ **Service**: Lógica de negocio
- ✅ **Controller**: Manejo de HTTP
- ✅ **DTOs**: Validación y transformación
- ✅ **Entities**: Definición de dominio

### 2. **Manejo de Errores**
```typescript
// ✅ Correcto: Usar excepciones específicas
throw new NotFoundException(`[Entity] with ID ${id} not found`);
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid input data');

// ✅ Correcto: Logging estructurado
this.logger.error(`Error creating [entity]:`, {
  data,
  error: error.message,
  stack: error.stack,
});
```

### 3. **Validación de Datos**
```typescript
// ✅ Correcto: DTOs con validaciones completas
export class Create[Entity]Dto {
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}
```

### 4. **Documentación de APIs**
```typescript
// ✅ Correcto: Documentación completa con Swagger
@ApiTags('[module-name]')
@Controller('[module-name]')
export class [ModuleName]Controller {
  @Get()
  @ApiOperation({
    summary: 'Obtener todos los [entities]',
    description: 'Retorna una lista paginada de [entities]'
  })
  @ApiResponse({
    status: 200,
    description: '[Entities] obtenidos exitosamente',
    type: [[Entity]ResponseDto],
  })
  async findAll() { /* ... */ }
}
```

### 5. **Testing**
```typescript
// ✅ Correcto: Tests unitarios completos
describe('[ModuleName]Service', () => {
  let service: [ModuleName]Service;
  let repository: [ModuleName]Repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        [ModuleName]Service,
        {
          provide: [ModuleName]Repository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<[ModuleName]Service>([ModuleName]Service);
    repository = module.get<[ModuleName]Repository>([ModuleName]Repository);
  });

  it('should return all [entities]', async () => {
    // Test implementation
  });
});
```

---

## 🎯 Checklist de Implementación

- [ ] **Preparación**
  - [ ] Estructura de directorios creada
  - [ ] Modelo Prisma definido
  - [ ] Migraciones ejecutadas

- [ ] **Interfaces y Tipos**
  - [ ] Interfaces de servicio y repositorio definidas
  - [ ] Tipos y enums creados
  - [ ] Entidades implementadas

- [ ] **DTOs**
  - [ ] Create[Entity]Dto con validaciones completas
  - [ ] Update[Entity]Dto con campos opcionales
  - [ ] [Entity]ResponseDto para respuestas
  - [ ] Documentación Swagger completa

- [ ] **Repository**
  - [ ] Implementación completa de la interfaz
  - [ ] Manejo de errores y logging
  - [ ] Mapeo correcto de entidades
  - [ ] Funciones auxiliares (buildWhereClause, etc.)

- [ ] **Service**
  - [ ] Lógica de negocio implementada
  - [ ] Validaciones de negocio
  - [ ] Manejo de transacciones si es necesario
  - [ ] Logging estructurado

- [ ] **Controller**
  - [ ] Endpoints REST completos (CRUD)
  - [ ] Validación de parámetros y body
  - [ ] Documentación Swagger completa
  - [ ] Manejo de códigos HTTP correctos

- [ ] **Módulo**
  - [ ] Configuración de dependencias correcta
  - [ ] Exports apropiados
  - [ ] Imports de módulos necesarios

- [ ] **Integración**
  - [ ] Agregado a app.module.ts
  - [ ] Tests unitarios implementados
  - [ ] Tests e2e implementados
  - [ ] Documentación actualizada

---

## 📚 Referencias Adicionales

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

*Esta documentación se basa en la validación de los módulos `registration` y `tasks`, que cumplen completamente con las mejores prácticas de desarrollo de Flucastr.*
