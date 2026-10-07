import 'dotenv/config';
import fs from 'node:fs';

const buildUrl = (database) => {
  const url =
    process.env.DATABASE_URL ||
    `postgres://${process.env.DB_USER }:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${database || process.env.DB_NAME || 'hospital_db'}`;
  if (!process.env.DATABASE_URL) return url;

  const connectionUrl = new URL(url);
  connectionUrl.searchParams.delete('sslmode');
  return connectionUrl.toString();
};

/* SSL mode resolution (Aiven URLs usually carry sslmode=require; the pg
   driver ignores it, so we read it ourselves and feed dialectOptions.ssl):
   - false / none / ''        -> no SSL (local dev)
   - true / require / prefer  -> SSL, no CA pinning
   - verify-ca / verify-full  -> SSL + CA certificate from DATABASE_CA */
const sslModeFromUrl = (url) => {
  if (!url) return null;
  try {
    return new URL(url).searchParams.get('sslmode');
  } catch {
    return null;
  }
};

const resolveSslMode = () => {
  const envMode = (process.env.DB_SSL || '').trim().toLowerCase();
  if (['true', 'require', 'prefer', 'verify-ca', 'verify-ca-full'].includes(envMode)) {
    return envMode === 'true' ? 'require' : envMode;
  }
  return sslModeFromUrl(process.env.DATABASE_URL) || 'false';
};

const hostFromUrl = () => {
  try {
    return new URL(process.env.DATABASE_URL).hostname;
  } catch {
    return null;
  }
};

const buildSsl = () => {
  const mode = resolveSslMode();
  if (['require', 'prefer'].includes(mode)) {
    return { ssl: true };
  }
  if (['verify-ca', 'verify-ca-full', 'verify-full'].includes(mode)) {
    const caPath = process.env.DATABASE_CA;
    if (!caPath) {
      throw new Error(`DB SSL mode "${mode}" requires DATABASE_CA (path to the Aiven ca.pem file).`);
    }
    const ssl = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caPath, 'utf8'),
    };
    if (mode.includes('full')) {
      const servername = hostFromUrl() || process.env.DB_HOST;
      if (servername) ssl.servername = servername;
    }
    return { ssl };
  }
  return { ssl: false };
};

const common = {
  dialect: 'postgres',
  seederStorage: 'sequelize',
  seederStorageTableName: 'SequelizeData',
};

export const config = {
  development: {
    ...common,
    url: buildUrl(),
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    dialectOptions: buildSsl(),
  },
  test: {
    ...common,
    url: buildUrl(`${process.env.DB_NAME || 'hospital_db'}_test`),
    logging: false,
    dialectOptions: buildSsl(),
  },
  production: {
    ...common,
    url: buildUrl(),
    logging: false,
    dialectOptions: buildSsl(),
  },
};

export default config;