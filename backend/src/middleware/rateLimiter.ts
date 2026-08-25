import { Request, Response, NextFunction } from 'express';

interface RateRecord {
  count: number;
  resetTime: number;
}

export class LayeredRateLimiter {
  private ipLimits: Map<string, RateRecord> = new Map();
  private accountLimits: Map<string, RateRecord> = new Map();
  private didLimits: Map<string, RateRecord> = new Map();

  private maxPerIpPerMin: number;
  private maxPerAccountPerMin: number;
  private maxPerDidPerMin: number;

  constructor(
    maxPerIpPerMin: number = 60,
    maxPerAccountPerMin: number = 30,
    maxPerDidPerMin: number = 30
  ) {
    this.maxPerIpPerMin = maxPerIpPerMin;
    this.maxPerAccountPerMin = maxPerAccountPerMin;
    this.maxPerDidPerMin = maxPerDidPerMin;
  }

  public checkRateLimit(req: Request, senderAddress?: string, agentDid?: string): { allowed: boolean; error?: string } {
    const now = Date.now();
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-ip';

    // 1. IP-Level Limiter
    let ipRec = this.ipLimits.get(clientIp);
    if (!ipRec || now > ipRec.resetTime) {
      ipRec = { count: 1, resetTime: now + 60_000 };
      this.ipLimits.set(clientIp, ipRec);
    } else {
      if (ipRec.count >= this.maxPerIpPerMin) {
        return { allowed: false, error: `IP rate limit exceeded (${this.maxPerIpPerMin} req/min)` };
      }
      ipRec.count += 1;
    }

    // 2. Account-Level Limiter
    if (senderAddress) {
      const accKey = senderAddress.toLowerCase();
      let accRec = this.accountLimits.get(accKey);
      if (!accRec || now > accRec.resetTime) {
        accRec = { count: 1, resetTime: now + 60_000 };
        this.accountLimits.set(accKey, accRec);
      } else {
        if (accRec.count >= this.maxPerAccountPerMin) {
          return { allowed: false, error: `Account rate limit exceeded (${this.maxPerAccountPerMin} sponsorships/min)` };
        }
        accRec.count += 1;
      }
    }

    // 3. Agent DID Limiter
    if (agentDid) {
      const didKey = agentDid.toLowerCase();
      let didRec = this.didLimits.get(didKey);
      if (!didRec || now > didRec.resetTime) {
        didRec = { count: 1, resetTime: now + 60_000 };
        this.didLimits.set(didKey, didRec);
      } else {
        if (didRec.count >= this.maxPerDidPerMin) {
          return { allowed: false, error: `Agent DID rate limit exceeded (${this.maxPerDidPerMin} sponsorships/min)` };
        }
        didRec.count += 1;
      }
    }

    return { allowed: true };
  }
}

export const defaultRateLimiter = new LayeredRateLimiter();
