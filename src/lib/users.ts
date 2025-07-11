export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Should be hashed in a real app
}

export const dummyUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    password: 'password123',
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '0987654321',
    password: 'password123',
  },
];
