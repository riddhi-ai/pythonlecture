import { connectDB, disconnectDB } from '../config/db.js';
import { UserModel } from '../models/User.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { seedWorkspaceData } from './sampleData.js';
import bcrypt from 'bcryptjs';

async function runSeed() {
  console.log('[Seed] Starting Creator Innovia demo data seeding...');
  await connectDB();

  // Create or retrieve main Creator account
  let creator = await UserModel.findOne({ email: 'creator@innovia.io' });
  let workspace;

  if (!creator) {
    workspace = await WorkspaceModel.create({
      name: 'Alex Rivera Studio',
      currency: 'USD',
      niche: 'Tech & Lifestyle',
      bio: 'Documenting the art of modern digital creation.',
      inviteCode: 'INNOVIA26',
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    creator = await UserModel.create({
      name: 'Alex Rivera',
      email: 'creator@innovia.io',
      passwordHash,
      role: 'CREATOR',
      avatarSticker: 'camera',
      hourlyRate: 5000, // $50/hr
      workspaceId: workspace._id,
    });

    workspace.ownerId = creator._id;
    await workspace.save();
  } else {
    workspace = await WorkspaceModel.findById(creator.workspaceId);
  }

  if (workspace && creator) {
    const result = await seedWorkspaceData(workspace._id.toString(), creator._id.toString());
    console.log('[Seed] Seeding completed successfully!');
    console.log('---------------------------------------------------------');
    console.log('DEMO LOGINS FOR ALL 3 ROLES:');
    console.log('1. Content Creator (Owner):');
    console.log('   Email:    creator@innovia.io');
    console.log('   Password: Password123!');
    console.log('2. Collaborator (Brand Partner):');
    console.log('   Email:    sponsor@innovia.io');
    console.log('   Password: Password123!');
    console.log('3. Team Member (Editor):');
    console.log('   Email:    editor@innovia.io');
    console.log('   Password: Password123!');
    console.log('---------------------------------------------------------');
  }

  await disconnectDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
