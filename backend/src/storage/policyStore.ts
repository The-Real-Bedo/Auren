import fs from 'fs';
import path from 'path';

export interface PersistentBudgetRecord {
  spentTodayWei: string;
  dayIndex: number;
  lastUpdated: number;
}

export class PolicyStore {
  private memoryStore: Map<string, PersistentBudgetRecord> = new Map();
  private filePath: string;
  private isPersistedToDisk: boolean = true;

  constructor(customFilePath?: string) {
    this.filePath = customFilePath || path.resolve(process.cwd(), '.auren_budget_store.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          this.memoryStore.set(k.toLowerCase(), v as PersistentBudgetRecord);
        }
      }
    } catch (e) {
      console.warn('PolicyStore: failed to load from disk, using clean memory store:', e);
    }
  }

  private saveToDisk(): void {
    if (!this.isPersistedToDisk) return;
    try {
      const obj: Record<string, PersistentBudgetRecord> = {};
      for (const [k, v] of this.memoryStore.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(this.filePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.warn('PolicyStore: failed to save to disk:', e);
    }
  }

  public getCurrentDayIndex(): number {
    return Math.floor(Date.now() / 86_400_000);
  }

  /**
   * Concurrency-safe atomic check and increment for DApp daily budget.
   * If requested amount fits within remaining daily budget, commits the spend and returns true.
   */
  public atomicSpendBudget(
    vaultAddress: string,
    amountWei: bigint,
    dailyBudgetWei: bigint
  ): { approved: boolean; currentSpentWei: bigint; remainingBudgetWei: bigint; error?: string } {
    const key = vaultAddress.toLowerCase();
    const currentDay = this.getCurrentDayIndex();

    let record = this.memoryStore.get(key);
    if (!record || record.dayIndex !== currentDay) {
      record = {
        spentTodayWei: '0',
        dayIndex: currentDay,
        lastUpdated: Date.now()
      };
    }

    const currentSpent = BigInt(record.spentTodayWei || '0');
    if (currentSpent + amountWei > dailyBudgetWei) {
      const remaining = dailyBudgetWei > currentSpent ? dailyBudgetWei - currentSpent : 0n;
      return {
        approved: false,
        currentSpentWei: currentSpent,
        remainingBudgetWei: remaining,
        error: `Daily sponsorship budget exceeded (Spent: ${currentSpent}, Requested: ${amountWei}, Budget: ${dailyBudgetWei})`
      };
    }

    const newSpent = currentSpent + amountWei;
    record.spentTodayWei = newSpent.toString();
    record.lastUpdated = Date.now();
    this.memoryStore.set(key, record);
    this.saveToDisk();

    return {
      approved: true,
      currentSpentWei: newSpent,
      remainingBudgetWei: dailyBudgetWei - newSpent
    };
  }

  public getBudgetStatus(vaultAddress: string, dailyBudgetWei: bigint): { spentTodayWei: bigint; remainingWei: bigint } {
    const key = vaultAddress.toLowerCase();
    const currentDay = this.getCurrentDayIndex();
    const record = this.memoryStore.get(key);

    if (!record || record.dayIndex !== currentDay) {
      return { spentTodayWei: 0n, remainingWei: dailyBudgetWei };
    }

    const spent = BigInt(record.spentTodayWei || '0');
    const remaining = dailyBudgetWei > spent ? dailyBudgetWei - spent : 0n;
    return { spentTodayWei: spent, remainingWei: remaining };
  }

  public resetStore(): void {
    this.memoryStore.clear();
    if (fs.existsSync(this.filePath)) {
      try {
        fs.unlinkSync(this.filePath);
      } catch {}
    }
  }
}

export const defaultPolicyStore = new PolicyStore();
