import {
  verifyPushbackSignature,
  verifyRawBodySignature,
} from './payments.service';
import { describe, expect, it } from '@jest/globals';
import * as crypto from 'crypto';

describe('verifyPushbackSignature', () => {
  const apiKey = 'test-api-key-123';
  const payload = {
    req_time: '1610000000',
    merchant_id: 'merchant123',
    tran_id: 'tx-001',
    amount: '10.00',
  } as Record<string, any>;

  it('verifies HMAC-SHA256 signature', () => {
    const base = `${payload.req_time}${payload.merchant_id}${payload.tran_id}${payload.amount}`;
    const hmac = crypto.createHmac('sha256', apiKey).update(base).digest('hex');
    const ok = verifyPushbackSignature(payload, hmac, apiKey);
    expect(ok).toBe(true);
  });

  it('verifies SHA256(base+apiKey) alt signature', () => {
    const base = `${payload.req_time}${payload.merchant_id}${payload.tran_id}${payload.amount}`;
    const alt = crypto
      .createHash('sha256')
      .update(base + apiKey)
      .digest('hex');
    const ok = verifyPushbackSignature(payload, alt, apiKey);
    expect(ok).toBe(true);
  });

  it('rejects invalid signatures', () => {
    const ok = verifyPushbackSignature(payload, 'deadbeef', apiKey);
    expect(ok).toBe(false);
  });

  it('verifies raw body HMAC hex signature', () => {
    const rawBody = JSON.stringify(payload);
    const sig = crypto
      .createHmac('sha256', apiKey)
      .update(rawBody)
      .digest('hex');
    const ok = verifyRawBodySignature(rawBody, sig, apiKey);
    expect(ok).toBe(true);
  });

  it('verifies raw body HMAC with sha256= prefix', () => {
    const rawBody = JSON.stringify(payload);
    const sig = crypto
      .createHmac('sha256', apiKey)
      .update(rawBody)
      .digest('hex');
    const ok = verifyRawBodySignature(rawBody, `sha256=${sig}`, apiKey);
    expect(ok).toBe(true);
  });
});
