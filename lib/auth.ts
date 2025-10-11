// Simple fixed authentication for BDO Guild Management
// In production, you might want to use a more robust auth solution

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'guild_leader';
}

// Fixed admin user - you can change these credentials
const ADMIN_USER: User = {
  id: 'admin-001',
  username: 'admin',
  role: 'admin'
};

// Simple session management (in production, use proper session management)
let currentUser: User | null = null;

export function login(username: string, password: string): User | null {
  // Simple hardcoded authentication
  // In production, use proper password hashing and database lookup
  if (username === 'admin' && password === 'bdo2024') {
    currentUser = ADMIN_USER;
    return ADMIN_USER;
  }
  return null;
}

export function logout(): void {
  currentUser = null;
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

export function requireAuth(): User {
  if (!currentUser) {
    throw new Error('Authentication required');
  }
  return currentUser;
}
