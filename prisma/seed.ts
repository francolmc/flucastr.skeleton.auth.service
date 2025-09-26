import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create system roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      description: 'Super Administrator with full system access',
      isSystem: true,
      priority: 100,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with elevated privileges',
      isSystem: true,
      priority: 80,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager with oversight capabilities',
      isSystem: true,
      priority: 60,
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with content management access',
      isSystem: true,
      priority: 40,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Standard user with basic access',
      isSystem: true,
      priority: 20,
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { name: 'guest' },
    update: {},
    create: {
      name: 'guest',
      description: 'Guest user with minimal access',
      isSystem: true,
      priority: 10,
    },
  });

  console.log('✅ System roles created');

  // Create basic permissions
  const permissions = [
    // User management
    { name: 'users:read', resource: 'users', action: 'read', description: 'View user information' },
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update user information' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },

    // Role management
    { name: 'roles:read', resource: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles:create', resource: 'roles', action: 'create', description: 'Create new roles' },
    { name: 'roles:update', resource: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Delete roles' },

    // Permission management
    { name: 'permissions:read', resource: 'permissions', action: 'read', description: 'View permissions' },
    { name: 'permissions:create', resource: 'permissions', action: 'create', description: 'Create new permissions' },
    { name: 'permissions:update', resource: 'permissions', action: 'update', description: 'Update permissions' },
    { name: 'permissions:delete', resource: 'permissions', action: 'delete', description: 'Delete permissions' },

    // Audit logs
    { name: 'audit:read', resource: 'audit', action: 'read', description: 'View audit logs' },

    // System configuration
    { name: 'system:read', resource: 'system', action: 'read', description: 'View system configuration' },
    { name: 'system:update', resource: 'system', action: 'update', description: 'Update system configuration' },

    // Authentication endpoints
    { name: 'auth:validate', resource: 'auth', action: 'validate', description: 'Validate JWT tokens' },
    { name: 'auth:health', resource: 'auth', action: 'health', description: 'Access health check endpoints' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        name: perm.name,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
        isSystem: true,
      },
    });
  }

  console.log('✅ Basic permissions created');

  // Assign permissions to roles

  // Super Admin - All permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin - Most permissions except system config
  const adminPermissions = allPermissions.filter(p =>
    !p.name.startsWith('system:') || p.name === 'system:read'
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Manager - User and role management, audit logs
  const managerPermissions = allPermissions.filter(p =>
    p.name.startsWith('users:') ||
    p.name.startsWith('roles:') ||
    p.name.startsWith('audit:')
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator - User read access, audit logs
  const moderatorPermissions = allPermissions.filter(p =>
    p.name === 'users:read' ||
    p.name.startsWith('audit:')
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User - Basic permissions
  const userPermissions = allPermissions.filter(p =>
    p.name === 'auth:validate' ||
    p.name === 'auth:health'
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Guest - Minimal permissions
  const guestPermissions = allPermissions.filter(p =>
    p.name === 'auth:health'
  );
  for (const permission of guestPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: guestRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: guestRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Role-permission assignments completed');

  // Create system configuration entries
  await prisma.systemConfig.upsert({
    where: { key: 'jwt_validation_enabled' },
    update: {},
    create: {
      key: 'jwt_validation_enabled',
      value: true,
      description: 'Enable JWT token validation',
      isPublic: false,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'rbac_enabled' },
    update: {},
    create: {
      key: 'rbac_enabled',
      value: true,
      description: 'Enable Role-Based Access Control',
      isPublic: false,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'abac_enabled' },
    update: {},
    create: {
      key: 'abac_enabled',
      value: true,
      description: 'Enable Attribute-Based Access Control',
      isPublic: false,
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'audit_logging_enabled' },
    update: {},
    create: {
      key: 'audit_logging_enabled',
      value: true,
      description: 'Enable audit logging for auth events',
      isPublic: false,
    },
  });

  console.log('✅ System configuration created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
