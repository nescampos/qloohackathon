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

  async getOrCreateUserProviderIdentity(provider: string, externalId: string, name?: string): Promise<{ identityId: number, globalUserId: number }> {
    // Buscar identidad existente
    const { data, error } = await this.client
      .from('user_provider_identity')
      .select('id, global_user_id')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      return { identityId: data.id, globalUserId: data.global_user_id };
    }
    // Crear global_user
    const { data: userData, error: userError } = await this.client
      .from('global_user')
      .insert({ name: name || externalId })
      .select('id')
      .single();
    if (userError) throw userError;
    const globalUserId = userData.id;
    // Crear identidad
    const { data: identityData, error: identityError } = await this.client
      .from('user_provider_identity')
      .insert({ global_user_id: globalUserId, provider, external_id: externalId })
      .select('id')
      .single();
    if (identityError) throw identityError;
    return { identityId: identityData.id, globalUserId };
  }

  async saveMessageByProvider(provider: string, externalId: string, message: string, role: 'user' | 'assistant', name?: string): Promise<void> {
    const { identityId } = await this.getOrCreateUserProviderIdentity(provider, externalId, name);
    const { error } = await this.client
      .from('chat_history')
      .insert({ user_provider_identity_id: identityId, message, role, timestamp: new Date().toISOString() });
    if (error) throw error;
  }

  async getRecentMessagesByProvider(provider: string, externalId: string, limit: number = 10): Promise<Array<{message: string, role: string, timestamp: string}>> {
    const { data: identity, error: identityError } = await this.client
      .from('user_provider_identity')
      .select('id')
      .eq('provider', provider)
      .eq('external_id', externalId)
      .maybeSingle();
    if (identityError) throw identityError;
    if (!identity) return [];
    const { data, error } = await this.client
      .from('chat_history')
      .select('message, role, timestamp')
      .eq('user_provider_identity_id', identity.id)
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