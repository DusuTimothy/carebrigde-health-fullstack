import crypto from 'node:crypto';
import { getSequelize } from '../config/database.js';
import {
  encryptPrivateKey,
  validateTlsMaterial,
  maskConfig,
  generateLocalCaPair,
  certValidTo,
} from '../services/tlsService.js';

export const getConfig = async (req, res, next) => {
  try {
    const records = await getSequelize().models.CaCertificate.findAll({ order: [['active', 'DESC'], ['createdAt', 'DESC']] });
    res.json({
      success: true,
      data: records.map(maskConfig),
    });
  } catch (error) {
    next(error);
  }
};

export const getCaCert = async (req, res, next) => {
  try {
    const record = await getSequelize().models.CaCertificate.findOne({ where: { active: true } });
    if (!record) {
      return res.status(404).json({ success: false, message: 'No active CA certificate configured.' });
    }
    res.set('Content-Type', 'application/x-pem-file');
    res.send(record.caCert);
  } catch (error) {
    next(error);
  }
};

export const upsertConfig = async (req, res, next) => {
  try {
    const { caCert, serverCert, serverKey, name, commonName, expiresAt, active } = req.body;
    validateTlsMaterial({ caCert, serverCert, serverKey });

    const model = getSequelize().models.CaCertificate;
    if (active) {
      await model.update({ active: false }, { where: { active: true } });
    }
    const record = await model.create({
      caCert,
      serverCert,
      serverKeyEnc: encryptPrivateKey(serverKey),
      name: name || 'Imported CA',
      commonName: commonName || new crypto.X509Certificate(serverCert).subject,
      issuedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(certValidTo(serverCert)),
      active: active !== false,
    });

    res.status(201).json({
      success: true,
      message: 'TLS key material saved. Restart the server to serve HTTPS with this certificate.',
      data: maskConfig(record),
    });
  } catch (error) {
    next(error);
  }
};

export const regenerate = async (req, res, next) => {
  try {
    const model = getSequelize().models.CaCertificate;
    await model.update({ active: false }, { where: { active: true } });
    const pair = generateLocalCaPair({ name: req.body?.name || 'Carebridge Local CA', commonName: req.body?.commonName || 'api.carebridge.local' });
    const record = await model.create({
      name: 'Auto-generated local CA',
      commonName: pair.caSubject,
      caCert: pair.caCert,
      serverCert: pair.serverCert,
      serverKeyEnc: encryptPrivateKey(pair.serverKey),
      issuedAt: new Date(),
      expiresAt: pair.expiresAt,
      active: true,
    });
    res.status(201).json({
      success: true,
      message: 'Fresh CA + server certificate generated and activated. Restart the server to serve it.',
      data: maskConfig(record),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConfig = async (req, res, next) => {
  try {
    const record = await getSequelize().models.CaCertificate.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'TLS config not found.' });
    }
    await record.destroy();
    res.json({ success: true, message: 'TLS config deleted.', data: { id: record.id } });
  } catch (error) {
    next(error);
  }
};