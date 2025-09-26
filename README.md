# Flucastr Auth Service

Microservicio de autenticación JWT + RBAC + ABAC para la plataforma Flucastr.

Este servicio implementa un sistema completo de autenticación y autorización que **NO genera tokens JWT**, sino que los **valida y consume** desde un servicio de autenticación centralizado.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env` y configura tus variables:
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones específicas.

### 3. Configurar base de datos
Actualiza el `DATABASE_URL` en tu archivo `.env` y ejecuta:
```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

### 4. Ejecutar en desarrollo
```bash
pnpm start:dev
```

### 5. Acceder a la documentación
- API: http://localhost:3001
- Swagger: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal de la aplicación
├── main.ts                # Punto de entrada de la aplicación
├── config/                # Configuraciones específicas
│   ├── jwt.config.ts      # Configuración JWT para validación
│   ├── app.config.ts      # Configuración general de la app
│   └── env.validation.ts  # Validación de variables de entorno
├── modules/               # Módulos de negocio
│   ├── auth/              # Módulo de autenticación
│   │   ├── auth.module.ts # Configuración del módulo auth
│   │   └── auth-example.controller.ts # Endpoints de ejemplo
│   ├── database/          # Configuración de base de datos
│   └── health/            # Endpoint de health check
└── shared/                # Código compartido
    └── guards/            # Guards JWT, RBAC y ABAC
        ├── jwt.guard.ts   # Validación de tokens JWT
        ├── rbac.guard.ts  # Control por roles (RBAC)
        └── abac.guard.ts  # Control por atributos (ABAC)
```

## 🏛️ Arquitectura del Servicio

### Flujo de Autenticación
```
Token JWT ──► JWT Guard ──► RBAC Guard ──► ABAC Guard ──► Endpoint
     │             │             │              │
     └─ Validación └─ Roles      └─ Atributos   └─ Recurso
```

### Componentes Principales
- **JWT Guard**: Valida tokens sin generarlos (consume de servicio centralizado)
- **RBAC Guard**: Control basado en roles del usuario
- **ABAC Guard**: Control basado en atributos (usuario, recurso, acción, contexto)
- **Database**: Almacena usuarios, roles, permisos y logs de auditoría
- **Audit System**: Registra todas las operaciones de autenticación/autorización

### Base de Datos
- **PostgreSQL** con Prisma ORM
- **6 roles del sistema** predefinidos con jerarquía
- **18 permisos básicos** organizados por recursos
- **Soporte multi-tenant** con aislamiento por tenantId
- **Auditoría completa** de todas las operaciones

## 🛠️ Scripts Disponibles

- `pnpm start` - Inicia la aplicación en modo producción
- `pnpm start:dev` - Inicia la aplicación en modo desarrollo con hot reload
- `pnpm start:debug` - Inicia la aplicación en modo debug
- `pnpm build` - Compila la aplicación
- `pnpm lint` - Ejecuta el linter y corrige errores automáticamente
- `pnpm test` - Ejecuta los tests
- `pnpm prisma:generate` - Genera el cliente de Prisma
- `pnpm prisma:studio` - Abre Prisma Studio para visualizar la base de datos
- `pnpm prisma:migrate:dev` - Ejecuta migraciones en desarrollo
- `pnpm prisma:seed` - Ejecuta el seed para poblar datos iniciales

## 🔧 Configuración

### Variables de Entorno
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `PORT`: Puerto en el que corre la aplicación (por defecto: 3001)
- `JWT_SECRET`: Clave secreta para validación de tokens JWT
- `JWT_ISSUER`: Emisor esperado de los tokens JWT
- `JWT_AUDIENCE`: Audiencia esperada de los tokens JWT

### Base de Datos
El servicio utiliza PostgreSQL con Prisma ORM y contiene los siguientes modelos principales:

#### Modelos de Autenticación
- **User**: Información de usuarios (email, nombre, estado, tenant)
- **Role**: Roles del sistema RBAC (super-admin, admin, manager, etc.)
- **Permission**: Permisos individuales (resource:action format)
- **UserRole**: Relación usuarios-roles (muchos-a-muchos)
- **RolePermission**: Relación roles-permisos (muchos-a-muchos)

#### Modelos de Sistema
- **AuditLog**: Logs de auditoría de operaciones de autenticación/autorización
- **SystemConfig**: Configuración dinámica del sistema

#### Roles del Sistema Predefinidos
1. **super-admin** (prioridad 100) - Acceso completo al sistema
2. **admin** (prioridad 80) - Privilegios elevados
3. **manager** (prioridad 60) - Gestión de usuarios y roles
4. **moderator** (prioridad 40) - Acceso de moderación
5. **user** (prioridad 20) - Usuario estándar
6. **guest** (prioridad 10) - Acceso mínimo

#### Permisos Básicos
- `users:*` - Gestión de usuarios (read, create, update, delete)
- `roles:*` - Gestión de roles
- `permissions:*` - Gestión de permisos
- `audit:*` - Acceso a logs de auditoría
- `system:*` - Configuración del sistema
- `auth:*` - Endpoints de autenticación

Para usar una base de datos diferente:

1. Actualiza el `DATABASE_URL` en `.env`
2. Modifica el schema de Prisma en `prisma/schema.prisma`
3. Ejecuta `pnpm prisma:generate` para regenerar el cliente

## 🔐 Características de Autenticación

### JWT Guard
- ✅ Validación de tokens JWT (NO generación)
- ✅ Extracción desde header, query o cookie
- ✅ Soporte para algoritmos HS256, RS256, etc.
- ✅ Verificación de issuer, audience, expiración
- ✅ Decoradores: `@CurrentUser`, `@UserRoles`, `@UserPermissions`

### RBAC (Role-Based Access Control)
- ✅ Control basado en roles del usuario
- ✅ Jerarquía de roles predefinida (super-admin → admin → manager → user → guest)
- ✅ Decoradores: `@Roles`, `@RequireAdmin`, `@RequireAllRoles`
- ✅ Soporte para múltiples roles (OR/AND logic)

### ABAC (Attribute-Based Access Control)
- ✅ Control basado en atributos (usuario, recurso, acción, contexto)
- ✅ Políticas predefinidas: resource-owner, same-tenant, business-hours
- ✅ Decoradores: `@CanRead`, `@CanWrite`, `@RequireResourceOwner`
- ✅ Sistema extensible de políticas y reglas

## 📝 Próximos Pasos

1. **Configurar JWT**: Actualiza las variables JWT en `.env` para que coincidan con tu servicio de autenticación
2. **Probar endpoints**: Usa Swagger para probar los endpoints de ejemplo (`/api`)
3. **Ver la base de datos**: Ejecuta `pnpm prisma:studio` para explorar los datos iniciales
4. **Implementar validación**: Los guards ya están listos para validar tokens y autorizar acceso
5. **Personalizar políticas**: Agrega tus propias políticas ABAC según necesites
6. **Configurar logging**: Revisa los logs de auditoría en la tabla `AuditLog`

## 🐳 Docker

Para ejecutar con Docker:

```bash
# Construir imagen
docker build -t flucastr-auth-service .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env flucastr-auth-service
```

## 📚 Documentación Adicional

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Swagger/OpenAPI](https://swagger.io/)
- [JWT.io - Debugger](https://jwt.io/) - Para probar y debuggear tokens JWT
- [RBAC vs ABAC](https://auth0.com/blog/role-based-access-control-rbac-and-attribute-based-access-control-abac/) - Comparación de modelos de control de acceso
- [Documentación de Autenticación](./docs/AUTHENTICATION.md) - Guía completa del sistema de autenticación

## 🤝 Contribución

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y ejecuta los tests: `pnpm test`
3. Ejecuta el linter: `pnpm lint`
4. Crea un commit descriptivo
5. Push y crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia UNLICENSED.