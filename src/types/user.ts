export interface User {
  id: string;
  wallet_address: string;
  username: string;
  email?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expires_at: string;
}

export interface CreateUserDto {
  wallet_address: string;
  username: string;
  email?: string;
  profile_picture?: string;
}

export interface WalletAuthMessage {
  message: string;
  timestamp: number;
  wallet_address: string;
}