//src/types/index.ts
export type Role = 'ADMIN' | 'FARMER' | 'PROVIDER';

export interface User {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}