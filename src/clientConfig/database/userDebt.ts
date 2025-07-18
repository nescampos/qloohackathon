import { createClientDb } from './clientDbFactory';

const clientDb = createClientDb();

export function initializeClientDb() {
  return clientDb.initialize();
}

export function getUserDebt(userId: string) {
  return clientDb.getUserDebt(userId);
}

export function setUserDebt(userId: string, amount: number) {
  return clientDb.setUserDebt(userId, amount);
} 