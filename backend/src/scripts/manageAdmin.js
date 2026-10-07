import 'dotenv/config';
import bcrypt from 'bcrypt';
import { initializeDatabase } from '../config/database.js';

const HELP = `
Hospital Management Admin CLI
Usage:
  node src/scripts/manageAdmin.js create --name "System Admin" --email admin@hospital.com --password secret123 --phone +233200000000
  node src/scripts/manageAdmin.js list
  node src/scripts/manageAdmin.js promote --email admin@hospital.com [--role admin]
  node src/scripts/manageAdmin.js reset-password --email admin@hospital.com --password newpassword
`;

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key.startsWith('--')) {
      args[key.slice(2)] = argv[i + 1];
      i += 1;
    }
  }
  return args;
};

const createAdmin = async (args) => {
  if (!args.name || !args.email || !args.password) {
    console.error('create requires --name, --email and --password.');
    console.log(HELP);
    process.exit(1);
  }
  if (args.password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const sequelize = await initializeDatabase();
  const { User } = sequelize.models;

  const existing = await User.findOne({ where: { email: args.email } });
  if (existing) {
    console.error(`A user with email "${args.email}" already exists.`);
    await sequelize.close();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(args.password, 12);
  const user = await User.create({
    name: args.name,
    email: args.email,
    phone: args.phone || null,
    password: hashed,
    role: 'admin',
  });
  console.log(`Admin created successfully.`);
  console.log(`  ID:    ${user.id}`);
  console.log(`  Name:  ${user.name}`);
  console.log(`  Email: ${user.email}`);
  await sequelize.close();
};

const listAdmins = async () => {
  const sequelize = await initializeDatabase();
  const { User } = sequelize.models;
  const admins = await User.findAll({
    where: { role: 'admin' },
    attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
    order: [['createdAt', 'ASC']],
  });
  if (admins.length === 0) {
    console.log('No admin users found.');
  } else {
    console.log(`Found ${admins.length} admin user(s):`);
    admins.forEach((admin) => {
      console.log(`  - ${admin.email} (${admin.name}) ${admin.phone ? `· ${admin.phone}` : ''} · ${admin.createdAt.toISOString().slice(0, 10)}`);
    });
  }
  await sequelize.close();
};

const promote = async (args) => {
  if (!args.email) {
    console.error('promote requires --email.');
    console.log(HELP);
    process.exit(1);
  }
  const role = args.role || 'admin';
  const sequelize = await initializeDatabase();
  const { User } = sequelize.models;
  const user = await User.findOne({ where: { email: args.email } });
  if (!user) {
    console.error(`No user found with email "${args.email}".`);
    await sequelize.close();
    process.exit(1);
  }
  await user.update({ role });
  console.log(`"${args.email}" is now ${role}.`);
  await sequelize.close();
};

const resetPassword = async (args) => {
  if (!args.email || !args.password) {
    console.error('reset-password requires --email and --password.');
    console.log(HELP);
    process.exit(1);
  }
  if (args.password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
  const sequelize = await initializeDatabase();
  const { User } = sequelize.models;
  const user = await User.findOne({ where: { email: args.email } });
  if (!user) {
    console.error(`No user found with email "${args.email}".`);
    await sequelize.close();
    process.exit(1);
  }
  await user.update({ password: await bcrypt.hash(args.password, 12) });
  console.log(`Password reset for "${args.email}".`);
  await sequelize.close();
};

const main = async () => {
  const [command] = process.argv.slice(2);
  const args = parseArgs(process.argv.slice(3));

  switch (command) {
    case 'create':
      await createAdmin(args);
      break;
    case 'list':
      await listAdmins();
      break;
    case 'promote':
      await promote(args);
      break;
    case 'reset-password':
      await resetPassword(args);
      break;
    default:
      console.log(HELP);
      process.exit(command ? 1 : 0);
  }
};

main().catch((error) => {
  console.error('Command failed:', error.message);
  process.exit(1);
});