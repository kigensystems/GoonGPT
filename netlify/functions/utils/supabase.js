import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// User operations
export async function createUser(userData) {
  console.log('🔍 SUPABASE: Creating user with data:', { 
    wallet_address: userData.wallet_address, 
    username: userData.username 
  });
  
  const user = {
    wallet_address: userData.wallet_address,
    username: userData.username,
    email: userData.email || null,
    profile_picture: userData.profile_picture || null,
    token_balance: 0,
    total_tokens_earned: 0,
    daily_tokens_earned: 0,
    last_token_earn_date: null,
    credits_balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();
  
  if (error) {
    console.error('❌ SUPABASE: Error creating user:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: User created successfully:', data.id);
  return data;
}

export async function getUserByWallet(walletAddress) {
  console.log('🔍 SUPABASE: Looking up user by wallet:', walletAddress);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('🔍 SUPABASE: No user found for wallet:', walletAddress);
      return null;
    }
    console.error('❌ SUPABASE: Error fetching user by wallet:', error);
    throw new Error(`Failed to get user by wallet: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: User found:', data.id);
  return data;
}

export async function getUserByUsername(username) {
  console.log('🔍 SUPABASE: Looking up user by username:', username);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('🔍 SUPABASE: No user found for username:', username);
      return null;
    }
    console.error('❌ SUPABASE: Error fetching user by username:', error);
    throw new Error(`Failed to get user by username: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: User found:', data.id);
  return data;
}

export async function getUserById(userId) {
  console.log('🔍 SUPABASE: Looking up user by ID:', userId);
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('🔍 SUPABASE: No user found for ID:', userId);
      return null;
    }
    console.error('❌ SUPABASE: Error fetching user by ID:', error);
    throw new Error(`Failed to get user by ID: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: User found:', data.id);
  return data;
}

export async function updateUser(userId, updates) {
  console.log('🔍 SUPABASE: Updating user:', userId, 'with:', Object.keys(updates));
  
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('users')
    .update(updatedData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('❌ SUPABASE: Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: User updated successfully');
  return data;
}

// Session operations
export async function createSession(userId, token) {
  console.log('🔍 SUPABASE: Creating session for user:', userId);
  
  const session = {
    user_id: userId,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('sessions')
    .insert(session)
    .select()
    .single();
  
  if (error) {
    console.error('❌ SUPABASE: Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Session created successfully');
  return data;
}

export async function getSession(token) {
  console.log('🔍 SUPABASE: Looking up session by token');
  
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('token', token)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('🔍 SUPABASE: No session found for token');
      return null;
    }
    console.error('❌ SUPABASE: Error fetching session:', error);
    throw new Error(`Failed to get session: ${error.message}`);
  }
  
  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    console.log('🔍 SUPABASE: Session expired, deleting');
    await deleteSession(token);
    return null;
  }
  
  console.log('✅ SUPABASE: Valid session found');
  return data;
}

export async function deleteSession(token) {
  console.log('🔍 SUPABASE: Deleting session');
  
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);
  
  if (error) {
    console.error('❌ SUPABASE: Error deleting session:', error);
    throw new Error(`Failed to delete session: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Session deleted successfully');
}