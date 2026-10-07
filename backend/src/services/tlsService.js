import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getSequelize } from '../config/database.js';

const DEV_SECRET = crypto.createHash('sha256').update('carebridge-dev-tls-master-key').digest('hex');

let warned = false;
export const getKeySecret = () => {
  if (!process.env.TLS_KEY_SECRET) {
    if (!warned) {
      console.warn('\n\x1b[33m[warning] TLS_KEY_SECRET is not set; falling back to the development master key.\x1b[0m\n');
      warned = true;
    }
    return DEV_SECRET;
  }
  return crypto.createHash('sha256').update(process.env.TLS_KEY_SECRET).digest('hex');
};

export const encryptPrivateKey = (keyPem) => {
  const key = Buffer.from(getKeySecret(), 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(keyPem, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${encrypted.toString('base64')}.${tag.toString('base64')}.${iv.toString('base64')}`;
};

export const decryptPrivateKey = (envelope) => {
  const [data, tag, iv] = envelope.split('.');
  const key = Buffer.from(getKeySecret(), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')) , decipher.final()]).toString('utf8');
};

export const certThumbprint = (pem) => new crypto.X509Certificate(pem).fingerprint256;
export const certSubject = (pem) => new crypto.X509Certificate(pem).subject;
export const certValidTo = (pem) => new crypto.X509Certificate(pem).validTo;

export const validateTlsMaterial = ({ caCert, serverCert, serverKey }) => {
  const ca = new crypto.X509Certificate(caCert);
  if (!ca.ca) {
    throw new Error('caCert must be a Certificate Authority certificate (basicConstraints CA:TRUE).');
  }
  const cert = new crypto.X509Certificate(serverCert);
  const key = crypto.createPrivateKey(serverKey);
  const certPub = cert.publicKey.export({ type: 'spki', format: 'der' });
  const keyPub = crypto.createPublicKey(key).export({ type: 'spki', format: 'der' });
  if (!certPub.equals(keyPub)) {
    throw new Error('serverKey does not match serverCert (public keys differ).');
  }
  return { ca, cert, key };
};

const runOpenssl = (args) => execFileSync('openssl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

export const generateLocalCaPair = ({ name = 'Carebridge Local CA', commonName = 'api.carebridge.local' } = {}) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tlsgen-'));
  const caKey = path.join(dir, 'ca.key');
  const caPem = path.join(dir, 'ca.pem');
  const srvKey = path.join(dir, 'server.key');
  const csr = path.join(dir, 'server.csr');
  const srvPem = path.join(dir, 'server.pem');
  const ext = path.join(dir, 'ext.cnf');
  try {
    runOpenssl(['genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:2048', '-out', caKey]);
    runOpenssl([
      'req', '-x509', '-new', '-key', caKey, '-sha256', '-days', '3650',
      '-subj', `/CN=${name}`,
      '-addext', 'basicConstraints=critical,CA:TRUE,pathlen:0',
      '-addext', 'keyUsage=critical,keyCertSign,cRLSign',
      '-out', caPem,
    ]);
    runOpenssl(['genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:2048', '-out', srvKey]);
    runOpenssl(['req', '-new', '-key', srvKey, '-subj', `/CN=${commonName}`, '-out', csr]);
    fs.writeFileSync(
      ext,
      'subjectAltName=DNS:localhost,DNS:api.carebridge.local,IP:127.0.0.1,IP:::1\n' +
        'basicConstraints=CA:FALSE\n' +
        'keyUsage=digitalSignature,keyEncipherment\n' +
        'extendedKeyUsage=serverAuth\n'
    );
    runOpenssl([
      'x509', '-req', '-in', csr, '-CA', caPem, '-CAkey', caKey, '-CAcreateserial',
      '-days', '825', '-sha256', '-extfile', ext, '-out', srvPem,
    ]);

    const caCert = fs.readFileSync(caPem, 'utf8').trim() + '\n';
    const serverCert = fs.readFileSync(srvPem, 'utf8').trim() + '\n';
    const serverKey = fs.readFileSync(srvKey, 'utf8').trim() + '\n';
    const xServer = new crypto.X509Certificate(serverCert);
    const xCa = new crypto.X509Certificate(caCert);

    return { caCert, serverCert, serverKey, expiresAt: new Date(xServer.validTo), caSubject: xCa.subject };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

export const loadActiveTls = async () => {
  const record = await getSequelize().models.CaCertificate.findOne({ where: { active: true } });
  if (!record) return null;
  return {
    key: decryptPrivateKey(record.serverKeyEnc),
    cert: record.serverCert,
    ca: record.caCert,
    commonName: record.commonName,
  };
};

const fingerprintOf = (pem) => {
  try {
    return new crypto.X509Certificate(pem).fingerprint256;
  } catch {
    return '';
  }
};

export const maskConfig = (record) => {
  const plain = record.toJSON ? record.toJSON() : record;
  return {
    id: plain.id,
    name: plain.name,
    commonName: plain.commonName,
    caCert: plain.caCert,
    serverCert: plain.serverCert,
    serverKeyPresent: Boolean(plain.serverKeyEnc),
    active: plain.active,
    issuedAt: plain.issuedAt,
    expiresAt: plain.expiresAt,
    createdAt: plain.createdAt,
    caThumbprint: fingerprintOf(plain.caCert),
    certThumbprint: fingerprintOf(plain.serverCert),
  };
};

export const ensureActiveTls = async () => {
  const model = getSequelize().models.CaCertificate;
  const existing = await model.findOne({ where: { active: true } });
  if (existing) return existing;

  const pair = generateLocalCaPair();
  const record = await model.create({
    name: 'Auto-generated local CA',
    commonName: new crypto.X509Certificate(pair.serverCert).subject,
    caCert: pair.caCert,
    serverCert: pair.serverCert,
    serverKeyEnc: encryptPrivateKey(pair.serverKey),
    issuedAt: new Date(),
    expiresAt: pair.expiresAt,
    active: true,
  });
  console.log(`\nGenerated and stored a local TLS CA in the database (fingerprint ${fingerprintOf(pair.caCert)}).`);
  console.log(`HTTPS will be served on TLS_PORT (${process.env.TLS_PORT || '5443'}). Clients must trust the CA from GET /api/tls/ca.\n`);
  return record;
};