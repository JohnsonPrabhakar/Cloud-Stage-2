export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Should be hashed in a real app
}

export const dummyUsers: User[] = [];
