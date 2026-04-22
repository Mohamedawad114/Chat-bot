import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private key: Buffer;

  constructor() {
    if (!process.env.CRYPTO_KEY) throw new Error('CRYPTO_KEY is missing');
    this.key = Buffer.from(process.env.CRYPTO_KEY as string, 'hex');
  }

  encryption(text: string): string {
    if (!text) throw new BadRequestException('Encryption text is required');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decryption(payload: string): string {
    const [ivHex, encrypted] = payload.split(':');
    if (!ivHex || !encrypted) throw new Error('Invalid encrypted payload');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
