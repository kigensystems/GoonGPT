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

// Token operations - uncapped token earning
export async function getUserTokenData(userId) {
  console.log('🔍 SUPABASE: Getting token data for user:', userId);
  
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  console.log('✅ SUPABASE: Token data retrieved successfully');
  return {
    token_balance: user.token_balance || 0,
    total_tokens_earned: user.total_tokens_earned || 0,
    credits_balance: user.credits_balance || 0
  };
}

// Earn tokens function - uncapped token earning
export async function earnTokens(userId, amount, action = 'Activity') {
  console.log('🔍 SUPABASE: Earning tokens for user:', userId, 'amount:', amount);
  
  const user = await getUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user with new token amounts (uncapped)
  const updatedUser = await updateUser(userId, {
    token_balance: (user.token_balance || 0) + amount,
    total_tokens_earned: (user.total_tokens_earned || 0) + amount
  });
  
  console.log('✅ SUPABASE: Tokens earned successfully');
  return {
    user: updatedUser,
    tokensEarned: amount,
    newBalance: updatedUser.token_balance
  };
}

// Development storage reset - no-op for Supabase (data is persistent)
export async function resetDevStorage() {
  console.log('🔍 SUPABASE: resetDevStorage called - no action needed for Supabase');
  // This is a no-op for Supabase since we don't want to delete production data
  // In development, you would manually clear the database if needed
}

// Video status operations
export async function createVideoStatus(trackId, fetchUrl, eta = 60) {
  console.log('🔍 SUPABASE: Creating video status for track_id:', trackId);
  
  const videoStatus = {
    track_id: trackId,
    status: 'processing',
    fetch_url: fetchUrl,
    eta: eta,
    webhook_received: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('video_status')
    .insert(videoStatus)
    .select()
    .single();
  
  if (error) {
    console.error('❌ SUPABASE: Error creating video status:', error);
    throw new Error(`Failed to create video status: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Video status created successfully');
  return data;
}

export async function getVideoStatus(trackId) {
  console.log('🔍 SUPABASE: Getting video status for track_id:', trackId);
  
  const { data, error } = await supabase
    .from('video_status')
    .select('*')
    .eq('track_id', trackId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      console.log('🔍 SUPABASE: No video status found for track_id:', trackId);
      return null;
    }
    console.error('❌ SUPABASE: Error fetching video status:', error);
    throw new Error(`Failed to get video status: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Video status found:', data.status);
  return data;
}

export async function updateVideoStatus(trackId, updates) {
  console.log('🔍 SUPABASE: Updating video status for track_id:', trackId);
  
  const updatedData = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('video_status')
    .update(updatedData)
    .eq('track_id', trackId)
    .select()
    .single();
  
  if (error) {
    console.error('❌ SUPABASE: Error updating video status:', error);
    throw new Error(`Failed to update video status: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Video status updated successfully');
  return data;
}

export async function deleteOldVideoStatus(olderThanHours = 24) {
  console.log('🔍 SUPABASE: Cleaning up old video status records older than', olderThanHours, 'hours');
  
  const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('video_status')
    .delete()
    .lt('created_at', cutoffTime)
    .select('track_id');
  
  if (error) {
    console.error('❌ SUPABASE: Error cleaning up old video status:', error);
    throw new Error(`Failed to cleanup video status: ${error.message}`);
  }
  
  console.log('✅ SUPABASE: Cleaned up', data.length, 'old video status records');
  return data;
}