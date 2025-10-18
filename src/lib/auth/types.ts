export type Role = "guest" | "user" | "lender" | "admin";

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  email?: string;
}

export interface AuthState {
  user: DemoUser | null;
  signIn: (opts: {
    email?: string;
    password?: string;
    code?: string;
    role?: Role;
  }) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
}


