import { User } from '../models/User.js';

const DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
};

export async function seedDatabase() {
  try {
    const existingAdmin = await User.findOneAndUpdate(
      { email: DEFAULT_ADMIN.email },
      { $setOnInsert: { name: DEFAULT_ADMIN.name }, $set: { role: DEFAULT_ADMIN.role } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );

    console.log('Default admin ready:', existingAdmin.email);
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}
