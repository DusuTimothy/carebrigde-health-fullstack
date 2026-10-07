import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

const { Client } = pg;

const getEnv = () => {
  const dbName = process.env.DB_NAME || 'hospital_db';
  return {
    dbName,
    testDb: `${dbName}_test`,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  };
};

export default async () => {
  const env = getEnv();
  const conn = new Client({
    host: env.host,
    port: env.port,
    user: env.user,
    password: env.password,
    database: 'postgres',
  });
  await conn.connect();

  const exists = await conn.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [env.testDb]
  );
  if (exists.rowCount === 0) {
    await conn.query(`CREATE DATABASE "${env.testDb}"`);
  }
  await conn.end();

  const testConn = new Client({
    host: env.host,
    port: env.port,
    user: env.user,
    password: env.password,
    database: env.testDb,
  });
  await testConn.connect();
  await testConn.query('DROP SCHEMA IF EXISTS public CASCADE');
  await testConn.query('CREATE SCHEMA public');
  await testConn.end();

  const cliPath = path.join(backendRoot, 'node_modules', '.bin', 'sequelize-cli');
  const run = (args) =>
    execFileSync(cliPath, args, {
      cwd: backendRoot,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
    });
  run(['db:migrate', '--env', 'test']);
  run(['db:seed:all', '--env', 'test']);
};