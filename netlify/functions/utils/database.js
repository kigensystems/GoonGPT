import { getStore } from '@netlify/blobs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Log available environment variables for debugging
console.log('Netlify Blobs Environment Debug:', {
  NETLIFY: process.env.NETLIFY,
  NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
  SITE_ID: process.env.SITE_ID,
  DEPLOY_ID: process.env.DEPLOY_ID,
  CONTEXT: process.env.CONTEXT,
  AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  NODE_ENV: process.env.NODE_ENV,
  // Check for any environment variables that might contain site ID
  env_keys: Object.keys(process.env).filter(key => 
    key.includes('SITE') || 
    key.includes('NETLIFY') || 
    key.includes('DEPLOY') ||
    key.includes('CONTEXT')
  )
});

// Check if we're in local development
// In production, NETLIFY will be 'true' and AWS_LAMBDA_FUNCTION_NAME will be set
const isLocalDev = !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && process.env.NODE_ENV !== 'production';

// File-based storage for local development
const DEV_STORAGE_DIR = isLocalDev ? path.join(process.cwd(), '.dev-storage') : null;
const USERS_FILE = isLocalDev ? path.join(DEV_STORAGE_DIR, 'users.json') : null;
const SESSIONS_FILE = isLocalDev ? path.join(DEV_STORAGE_DIR, 'sessions.json') : null;

// Ensure storage directory exists (only in local dev)
if (isLocalDev && DEV_STORAGE_DIR) {
  try {
    if (!fs.existsSync(DEV_STORAGE_DIR)) {
      fs.mkdirSync(DEV_STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create dev storage directory:', error);
    // Don't fail the entire module if directory creation fails
  }
}

// Load data from file
function loadDevData(filename) {
  if (!isLocalDev || !filename) return new Map();
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
  if (!isLocalDev || !filename) return;
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
  if (isLocalDev && USERS_FILE && SESSIONS_FILE) {
    devUsers.clear();
    devSessions.clear();
    saveDevData(USERS_FILE, devUsers);
    saveDevData(SESSIONS_FILE, devSessions);
    console.log('Development storage cleared');
  }
}

// Simple store getter using Functions API v2 auto-configuration
function getNetlifyStore(storeName) {
  try {
    // Functions API v2 auto-configuration - no context or manual config needed
    return getStore(storeName);
  } catch (error) {
    console.error(`Failed to get store "${storeName}": ${error.message}`);
    throw new Error(`Failed to initialize Netlify Blobs store "${storeName}": ${error.message}`);
  }
}

// Initialize stores
export const getUsersStore = () => {
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
  return getNetlifyStore('users');
};

export const getSessionsStore = () => {
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
  return getNetlifyStore('sessions');
};

// User operations
export async function createUser(userData) {
  const usersStore = getUsersStore();
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

export async function getUserByWallet(walletAddress) {
  const usersStore = getUsersStore();
  return await usersStore.get(`wallet:${walletAddress}`, { type: 'json' });
}

export async function getUserByUsername(username) {
  const usersStore = getUsersStore();
  return await usersStore.get(`username:${username}`, { type: 'json' });
}

export async function getUserById(userId) {
  const usersStore = getUsersStore();
  return await usersStore.get(`id:${userId}`, { type: 'json' });
}

export async function updateUser(userId, updates) {
  const usersStore = getUsersStore();
  const user = await getUserById(userId);
  
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
export async function createSession(userId, token) {
  const sessionsStore = getSessionsStore();
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

export async function getSession(token) {
  const sessionsStore = getSessionsStore();
  const session = await sessionsStore.get(token, { type: 'json' });
  
  if (!session) return null;
  
  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    await sessionsStore.delete(token);
    return null;
  }
  
  return session;
}

export async function deleteSession(token) {
  const sessionsStore = getSessionsStore();
  await sessionsStore.delete(token);
}

// Token operations
export async function earnTokens(userId, amount, action = 'Activity') {
  const DAILY_TOKEN_LIMIT = 100;
  const user = await getUserById(userId);
  
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
  const updatedUser = await updateUser(userId, {
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
  
  const usersStore = getUsersStore();
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
  
  const usersStore = getUsersStore();
  const transactions = await usersStore.get(`transactions:${userId}`, { type: 'json' }) || [];
  
  const today = new Date().toISOString().split('T')[0];
  const lastEarnDate = user.last_token_earn_date?.split('T')[0];
  
  // Reset daily counter if it's a new day
  let dailyTokensEarned = user.daily_tokens_earned || 0;
  let updatedUser = user;
  
  if (lastEarnDate !== today) {
    dailyTokensEarned = 0;
    // Persist the daily reset to the database
    updatedUser = await updateUser(userId, {
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