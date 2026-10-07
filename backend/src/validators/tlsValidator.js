import { z } from 'zod';

export const upsertTlsSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    commonName: z.string().trim().min(1).max(120).optional(),
    caCert: z.string().trim().min(20, 'Paste the CA certificate in PEM format (-----BEGIN CERTIFICATE----- ...)'),
    serverCert: z.string().trim().min(20, 'Paste the server certificate in PEM format (-----BEGIN CERTIFICATE----- ...)'),
    serverKey: z.string().trim().min(20, 'Paste the server private key in PEM format (-----BEGIN ... PRIVATE KEY----- ...)'),
    expiresAt: z.string().optional(),
    active: z.boolean().optional(),
  })
  .strict();

export default { upsertTlsSchema };