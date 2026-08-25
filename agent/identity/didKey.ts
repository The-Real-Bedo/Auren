import { ethers } from 'ethers';
import crypto from 'crypto';

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B58_MAP = new Map(B58.split('').map((c, i) => [c, BigInt(i)]));

function multibase(raw: Buffer): string {
  let n = BigInt('0x' + raw.toString('hex'));
  let out = '';
  while (n > 0n) {
    const rem = n % 58n;
    n = n / 58n;
    out = B58[Number(rem)] + out;
  }
  return out;
}

function b58Decode(str: string): Buffer {
  let n = 0n;
  for (const c of str) {
    const val = B58_MAP.get(c);
    if (val === undefined) throw new Error(`Invalid base58 character: ${c}`);
    n = n * 58n + val;
  }
  let hex = n.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

export interface SignedEnvelope<T = any> {
  did: string;
  timestamp: number;
  nonce: string;
  action: string;
  payload: T;
  signature: string;
}

/**
 * TechnoCore-compatible Agent Identity
 *
 * Supports:
 * 1. Ed25519 did:key (did:key:z6Mk...) compliant with technocore-chat (src/didkey.py)
 * 2. EVM Keypair for on-chain identity & Arc transaction dispatch
 */
export class AgentIdentity {
  public readonly did: string;           // e.g. did:key:z6Mku...
  public readonly address: string;       // EVM address for Arc transactions
  private readonly ed25519PrivateKey: crypto.KeyObject;
  private readonly ed25519PublicKey: crypto.KeyObject;
  private readonly evmWallet: ethers.HDNodeWallet | ethers.Wallet;

  constructor(evmPrivateKeyHex?: string, ed25519SeedHex?: string) {
    // 1. Initialize EVM Wallet
    if (evmPrivateKeyHex) {
      this.evmWallet = new ethers.Wallet(evmPrivateKeyHex);
    } else {
      this.evmWallet = ethers.Wallet.createRandom();
    }
    this.address = this.evmWallet.address;

    // 2. Initialize Ed25519 Keypair (TechnoCore did:key)
    if (ed25519SeedHex && ed25519SeedHex.length === 64) {
      const privKeyDer = Buffer.concat([
        Buffer.from('302e020100300506032b657004220420', 'hex'),
        Buffer.from(ed25519SeedHex, 'hex')
      ]);
      this.ed25519PrivateKey = crypto.createPrivateKey({ key: privKeyDer, format: 'der', type: 'pkcs8' });
      this.ed25519PublicKey = crypto.createPublicKey(this.ed25519PrivateKey);
    } else {
      const pair = crypto.generateKeyPairSync('ed25519');
      this.ed25519PrivateKey = pair.privateKey;
      this.ed25519PublicKey = pair.publicKey;
    }

    const rawPub = this.ed25519PublicKey.export({ type: 'spki', format: 'der' }).subarray(-32);
    const mb = 'z' + multibase(Buffer.concat([Buffer.from([0xed, 0x01]), rawPub]));
    this.did = 'did:key:' + mb;
  }

  /**
   * Signs a message payload into a TechnoCore did:key signed envelope.
   */
  public async signPayload<T = any>(action: string, payload: T): Promise<SignedEnvelope<T>> {
    const timestamp = Date.now();
    const nonce = String(Math.floor(Date.now() * 1000 + Math.random() * 1000));
    const canonicalMessage = AgentIdentity.computeCanonicalString(this.did, timestamp, nonce, action, payload);

    const sig = crypto.sign(null, Buffer.from(canonicalMessage, 'utf-8'), this.ed25519PrivateKey).toString('base64url');

    return {
      did: this.did,
      timestamp,
      nonce,
      action,
      payload,
      signature: sig
    };
  }

  /**
   * Computes the deterministic canonical representation of the action intent.
   */
  public static computeCanonicalString(
    did: string,
    timestamp: number,
    nonce: string,
    action: string,
    payload: any
  ): string {
    const canonicalPayload = JSON.stringify(payload, Object.keys(payload || {}).sort());
    return `${did}|${timestamp}|${nonce}|${action}|${canonicalPayload}`;
  }

  /**
   * Verifies an Ed25519 did:key signed envelope offline (no central registry needed).
   */
  public static verifyEnvelope(
    envelope: SignedEnvelope,
    maxAgeMs: number = 120_000
  ): { valid: boolean; error?: string } {
    if (!envelope || !envelope.did || !envelope.signature || !envelope.nonce || !envelope.timestamp) {
      return { valid: false, error: 'Malformed envelope: missing required fields' };
    }

    // Freshness check
    const now = Date.now();
    if (Math.abs(now - envelope.timestamp) > maxAgeMs) {
      return { valid: false, error: `Envelope timestamp expired (${envelope.timestamp} vs current ${now})` };
    }

    // Validate Ed25519 did:key format
    if (!envelope.did.startsWith('did:key:z6Mk')) {
      return { valid: false, error: 'Unsupported DID: must be Ed25519 did:key (did:key:z6Mk...)' };
    }

    const mb = envelope.did.replace('did:key:', '');
    try {
      const decoded = b58Decode(mb.slice(1));
      if (decoded.length < 34 || decoded[0] !== 0xed || decoded[1] !== 0x01) {
        return { valid: false, error: 'Invalid Ed25519 multicodec prefix in did:key' };
      }
      const rawPub = decoded.subarray(2);

      const spkiDer = Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'),
        rawPub
      ]);
      const pubKeyObj = crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });

      const canonicalMessage = AgentIdentity.computeCanonicalString(
        envelope.did,
        envelope.timestamp,
        envelope.nonce,
        envelope.action,
        envelope.payload
      );

      const sigBuffer = Buffer.from(envelope.signature, 'base64url');
      const verified = crypto.verify(null, Buffer.from(canonicalMessage, 'utf-8'), pubKeyObj, sigBuffer);

      if (!verified) {
        return { valid: false, error: 'Ed25519 signature does not cover this action payload' };
      }

      return { valid: true };
    } catch (e: any) {
      return { valid: false, error: `Cryptographic verification failed: ${e.message}` };
    }
  }
}
