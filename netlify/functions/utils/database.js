import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Check if we're in local development
const isLocalDev = process.env.NODE_ENV !== 'production' && !process.env.NETLIFY;

// File-based storage for local development
const DEV_STORAGE_DIR = path.join(process.cwd(), '.dev-storage');
const USERS_FILE = path.join(DEV_STORAGE_DIR, 'users.json');
const SESSIONS_FILE = path.join(DEV_STORAGE_DIR, 'sessions.json');

// Ensure storage directory exists
if (isLocalDev) {
  if (!fs.existsSync(DEV_STORAGE_DIR)) {
    fs.mkdirSync(DEV_STORAGE_DIR, { recursive: true });
  }
}

// Load data from file
function loadDevData(filename) {
  if (!isLocalDev) return new Map();
  try {
    if (fs.existsSync(filename)) {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.error('Error loading dev data:', error);
  }
  return new Map();
}

// Save data to file
function saveDevData(filename, map) {
  if (!isLocalDev) return;
  try {
    const data = Object.fromEntries(map);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving dev data:', error);
  }
}

// Initialize storage
let devUsers = loadDevData(USERS_FILE);
let devSessions = loadDevData(SESSIONS_FILE);

// Reset function for development
export function resetDevStorage() {
  if (isLocalDev) {
    devUsers.clear();
    devSessions.clear();
    saveDevData(USERS_FILE, devUsers);
    saveDevData(SESSIONS_FILE, devSessions);
    console.log('Development storage cleared');
  }
}

// Initialize stores
export const getUsersStore = (context) => {
  if (isLocalDev) {
    return {
      get: async (key, options = {}) => {
        const value = devUsers.get(key);
        return options.type === 'json' && value ? JSON.parse(value) : value;
      },
      set: async (key, value) => {
        devUsers.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        saveDevData(USERS_FILE, devUsers);
      },
      delete: async (key) => {
        devUsers.delete(key);
        saveDevData(USERS_FILE, devUsers);
      }
    };
  }
  return getStore('users', context);
};

export const getSessionsStore = (context) => {
  if (isLocalDev) {
    return {
      get: async (key, options = {}) => {
        const value = devSessions.get(key);
        return options.type === 'json' && value ? JSON.parse(value) : value;
      },
      set: async (key, value) => {
        devSessions.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        saveDevData(SESSIONS_FILE, devSessions);
      },
      delete: async (key) => {
        devSessions.delete(key);
        saveDevData(SESSIONS_FILE, devSessions);
      }
    };
  }
  return getStore('sessions', context);
};

// User operations
export async function createUser(context, userData) {
  const usersStore = getUsersStore(context);
  const user = {
    id: crypto.randomUUID(),
    ...userData,
    // Token tracking fields
    token_balance: 0,
    total_tokens_earned: 0,
    daily_tokens_earned: 0,
    last_token_earn_date: null,
    credits_balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Store by wallet address and username for uniqueness checks
  await usersStore.set(`wallet:${userData.wallet_address}`, user);
  await usersStore.set(`username:${userData.username}`, user);
  await usersStore.set(`id:${user.id}`, user);
  
  return user;
}

export async function getUserByWallet(context, walletAddress) {
  const usersStore = getUsersStore(context);
  return await usersStore.get(`wallet:${walletAddress}`, { type: 'json' });
}

export async function getUserByUsername(context, username) {
  const usersStore = getUsersStore(context);
  return await usersStore.get(`username:${username}`, { type: 'json' });
}

export async function getUserById(context, userId) {
  const usersStore = getUsersStore(context);
  return await usersStore.get(`id:${userId}`, { type: 'json' });
}

export async function updateUser(context, userId, updates) {
  const usersStore = getUsersStore(context);
  const user = await getUserById(context, userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const updatedUser = {
    ...user,
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  // Update all references
  await usersStore.set(`id:${userId}`, updatedUser);
  await usersStore.set(`wallet:${user.wallet_address}`, updatedUser);
  
  // Handle username change
  if (updates.username && updates.username !== user.username) {
    await usersStore.delete(`username:${user.username}`);
    await usersStore.set(`username:${updates.username}`, updatedUser);
  } else {
    await usersStore.set(`username:${user.username}`, updatedUser);
  }
  
  return updatedUser;
}

// Session operations
export async function createSession(context, userId, token) {
  const sessionsStore = getSessionsStore(context);
  const session = {
    id: crypto.randomUUID(),
    user_id: userId,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    created_at: new Date().toISOString()
  };
  
  await sessionsStore.set(token, session);
  return session;
}

export async function getSession(context, token) {
  const sessionsStore = getSessionsStore(context);
  const session = await sessionsStore.get(token, { type: 'json' });
  
  if (!session) return null;
  
  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    await sessionsStore.delete(token);
    return null;
  }
  
  return session;
}

export async function deleteSession(context, token) {
  const sessionsStore = getSessionsStore(context);
  await sessionsStore.delete(token);
}

// Token operations
export async function earnTokens(context, userId, amount, action = 'Activity') {
  const DAILY_TOKEN_LIMIT = 100;
  const user = await getUserById(context, userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const today = new Date().toISOString().split('T')[0];
  const lastEarnDate = user.last_token_earn_date?.split('T')[0];
  
  // Reset daily counter if it's a new day
  let dailyTokensEarned = user.daily_tokens_earned || 0;
  if (lastEarnDate !== today) {
    dailyTokensEarned = 0;
  }
  
  // Check if daily limit would be exceeded
  if (dailyTokensEarned + amount > DAILY_TOKEN_LIMIT) {
    const remainingTokens = DAILY_TOKEN_LIMIT - dailyTokensEarned;
    if (remainingTokens <= 0) {
      throw new Error('Daily token limit reached');
    }
    amount = remainingTokens; // Only award remaining tokens
  }
  
  // Update user with new token amounts
  const updatedUser = await updateUser(context, userId, {
    token_balance: (user.token_balance || 0) + amount,
    total_tokens_earned: (user.total_tokens_earned || 0) + amount,
    daily_tokens_earned: dailyTokensEarned + amount,
    last_token_earn_date: new Date().toISOString()
  });
  
  // Store transaction record
  const transaction = {
    id: crypto.randomUUID(),
    user_id: userId,
    amount,
    action,
    type: 'earn',
    created_at: new Date().toISOString()
  };
  
  const usersStore = getUsersStore(context);
  const userTransactions = await usersStore.get(`transactions:${userId}`, { type: 'json' }) || [];
  userTransactions.unshift(transaction);
  
  // Keep only last 50 transactions
  if (userTransactions.length > 50) {
    userTransactions.splice(50);
  }
  
  await usersStore.set(`transactions:${userId}`, userTransactions);
  
  return {
    user: updatedUser,
    transaction,
    tokensEarned: amount,
    dailyLimit: DAILY_TOKEN_LIMIT,
    dailyRemaining: DAILY_TOKEN_LIMIT - (dailyTokensEarned + amount)
  };
}

export async function getUserTokenData(context, userId) {
  const user = await getUserById(context, userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const usersStore = getUsersStore(context);
  const transactions = await usersStore.get(`transactions:${userId}`, { type: 'json' }) || [];
  
  const today = new Date().toISOString().split('T')[0];
  const lastEarnDate = user.last_token_earn_date?.split('T')[0];
  
  // Reset daily counter if it's a new day
  let dailyTokensEarned = user.daily_tokens_earned || 0;
  let updatedUser = user;
  
  if (lastEarnDate !== today) {
    dailyTokensEarned = 0;
    // Persist the daily reset to the database
    updatedUser = await updateUser(context, userId, {
      daily_tokens_earned: 0,
      last_token_earn_date: new Date().toISOString()
    });
  }
  
  return {
    token_balance: updatedUser.token_balance || 0,
    total_tokens_earned: updatedUser.total_tokens_earned || 0,
    daily_tokens_earned: dailyTokensEarned,
    credits_balance: updatedUser.credits_balance || 0,
    daily_limit: 100,
    daily_remaining: 100 - dailyTokensEarned,
    transactions: transactions.slice(0, 10) // Return last 10 transactions
  };
}