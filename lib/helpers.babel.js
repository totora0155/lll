import crypto from 'crypto';

export function getToken() {
  return crypto.randomBytes(5).toString('hex');
}
