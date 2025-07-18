import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IClientDb } from './IClientDb';

export class SupabaseClientDb implements IClientDb {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async initialize(): Promise<void> {
    throw new Error('La tabla user_debts debe crearse manualmente en el dashboard de Supabase.');
  }

  async getUserDebt(userId: string): Promise<number | null> {
    const { data, error } = await this.client
      .from('user_debts')
      .select('amount')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? data.amount : null;
  }

  async setUserDebt(userId: string, amount: number): Promise<void> {
    const { error } = await this.client
      .from('user_debts')
      .upsert({ user_id: userId, amount });
    if (error) throw error;
  }

  async close(): Promise<void> {
    // No persistent connection to close in Supabase
  }
} 