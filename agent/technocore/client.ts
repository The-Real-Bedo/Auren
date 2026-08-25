import crypto from 'crypto';

export interface TechnoCoreMessage {
  seq: number;
  ts: number;
  from: string;
  text: string;
}

export interface TechnoCoreRoomResponse {
  room: string;
  messages: TechnoCoreMessage[];
}

/**
 * TechnoCore Client
 * 
 * Interacts with technocore-chat over plain HTTP GETs:
 * - Room messaging: /r/<room>/say/<nick>/<text>
 * - Room reading: /r/<room>?since=<seq>
 * - Key-Value Notes: /kv/<ns>/<key>/set/<value> and /kv/<ns>/<key>
 * 
 * Supports remote TechnoCore host (e.g. https://technocore.chat or http://localhost:8080)
 * with an integrated in-memory fallback for local execution and offline tests.
 */
export class TechnoCoreClient {
  private baseUrl: string;
  private inMemoryRooms: Map<string, TechnoCoreMessage[]> = new Map();
  private inMemoryKv: Map<string, string> = new Map();
  private seqCounters: Map<string, number> = new Map();

  constructor(baseUrl: string = process.env.TECHNOCORE_URL || 'https://technocore.chat') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Posts a message to a TechnoCore room via GET /r/<room>/say/<nick>/<text>
   */
  public async say(room: string, nick: string, text: string): Promise<{ success: boolean; seq?: number }> {
    const cleanRoom = this.sanitizeName(room);
    const cleanNick = this.sanitizeName(nick);
    const encodedText = encodeURIComponent(text);
    const url = `${this.baseUrl}/r/${cleanRoom}/say/${cleanNick}/${encodedText}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        return { success: true };
      }
    } catch {
      // Graceful fallback to in-memory store
    }

    // Fallback store
    const messages = this.inMemoryRooms.get(cleanRoom) || [];
    const seq = (this.seqCounters.get(cleanRoom) || 0) + 1;
    this.seqCounters.set(cleanRoom, seq);

    const msg: TechnoCoreMessage = {
      seq,
      ts: Date.now(),
      from: cleanNick,
      text
    };
    messages.push(msg);
    if (messages.length > 200) messages.shift();
    this.inMemoryRooms.set(cleanRoom, messages);

    return { success: true, seq };
  }

  /**
   * Reads messages from a TechnoCore room via GET /r/<room>?since=<seq>&format=json
   */
  public async readRoom(room: string, since: number = 0): Promise<TechnoCoreMessage[]> {
    const cleanRoom = this.sanitizeName(room);
    const url = `${this.baseUrl}/r/${cleanRoom}?since=${since}&format=json`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        return data.messages || [];
      }
    } catch {
      // Fallback
    }

    const messages = this.inMemoryRooms.get(cleanRoom) || [];
    return messages.filter(m => m.seq > since);
  }

  /**
   * Persists a durable note in TechnoCore via GET /kv/<ns>/<key>/set/<value>
   */
  public async setNote(ns: string, key: string, value: string): Promise<boolean> {
    const cleanNs = this.sanitizeName(ns);
    const cleanKey = this.sanitizeName(key);
    const encodedValue = encodeURIComponent(value);
    const url = `${this.baseUrl}/kv/${cleanNs}/${cleanKey}/set/${encodedValue}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        return true;
      }
    } catch {
      // Fallback
    }

    this.inMemoryKv.set(`${cleanNs}:${cleanKey}`, value);
    return true;
  }

  /**
   * Reads a durable note from TechnoCore via GET /kv/<ns>/<key>
   */
  public async getNote(ns: string, key: string): Promise<string | null> {
    const cleanNs = this.sanitizeName(ns);
    const cleanKey = this.sanitizeName(key);
    const url = `${this.baseUrl}/kv/${cleanNs}/${cleanKey}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        return await res.text();
      }
    } catch {
      // Fallback
    }

    return this.inMemoryKv.get(`${cleanNs}:${cleanKey}`) || null;
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 48) || 'default';
  }
}
