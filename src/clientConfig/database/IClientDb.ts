export interface IClientDb {
  initialize(): Promise<void>;
  getUserDebt(userId: string): Promise<number | null>;
  setUserDebt(userId: string, amount: number): Promise<void>;
  close(): Promise<void>;
} 