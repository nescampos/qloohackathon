import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDatabase } from './IDatabase';

export class SupabaseDatabase implements IDatabase {
  private client: SupabaseClient;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async initialize(): Promise<void> {
    // No-op: Supabase tables must be created manually in the dashboard.
  }

  async getThreadId(phoneNumber: string): Promise<string | null> {
    const { data, error } = await this.client
      .from('user_threads')
      .select('thread_id')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (error) throw error;
    return data?.thread_id || null;
  }

  async saveThreadId(phoneNumber: string, threadId: string): Promise<void> {
    const { error } = await this.client
      .from('user_threads')
      .upsert({
        phone_number: phoneNumber,
        thread_id: threadId,
        last_interaction: new Date().toISOString(),
      }, { onConflict: 'phone_number' });
    if (error) throw error;
  }

  async saveMessage(phoneNumber: string, threadId: string, message: string, role: 'user' | 'assistant'): Promise<void> {
    const { error: msgError } = await this.client
      .from('chat_history')
      .insert({
        phone_number: phoneNumber,
        thread_id: threadId,
        message,
        role,
        timestamp: new Date().toISOString(),
      });
    if (msgError) {
      throw msgError;
    }
    const { error: updateError } = await this.client
      .from('user_threads')
      .update({ last_interaction: new Date().toISOString() })
      .eq('phone_number', phoneNumber);
    if (updateError) throw updateError;
  }

  async getRecentMessages(phoneNumber: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
    const { data, error } = await this.client
      .from('chat_history')
      .select('message, role, timestamp')
      .eq('phone_number', phoneNumber)
      .order('timestamp', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async saveUserDebt(phoneNumber: string, name: string | null, debtAmount: number, dueDate: Date): Promise<void> {
    const { error } = await this.client
      .from('user_debt')
      .upsert({
        phone_number: phoneNumber,
        name,
        debt_amount: debtAmount,
        due_date: dueDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      }, { onConflict: 'phone_number' });
    if (error) throw error;
  }

  async getUserDebt(phoneNumber: string): Promise<{
    phoneNumber: string;
    name: string | null;
    debtAmount: number;
    dueDate: Date;
    createdAt: Date;
  } | null> {
    const { data, error } = await this.client
      .from('user_debt')
      .select('phone_number, name, debt_amount, due_date, created_at')
      .eq('phone_number', phoneNumber)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      phoneNumber: data.phone_number,
      name: data.name,
      debtAmount: data.debt_amount,
      dueDate: new Date(data.due_date),
      createdAt: new Date(data.created_at),
    };
  }

  async getOverdueDebts(date: Date): Promise<Array<{
    phoneNumber: string;
    name: string | null;
    debtAmount: number;
    dueDate: Date;
    createdAt: Date;
  }>> {
    const { data, error } = await this.client
      .from('user_debt')
      .select('phone_number, name, debt_amount, due_date, created_at')
      .lte('due_date', date.toISOString().split('T')[0])
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      phoneNumber: row.phone_number,
      name: row.name,
      debtAmount: row.debt_amount,
      dueDate: new Date(row.due_date),
      createdAt: new Date(row.created_at),
    }));
  }

  async close(): Promise<void> {
    // No persistent connection to close in Supabase
  }
} 