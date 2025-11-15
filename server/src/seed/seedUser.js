import Conversation from '../models/conversationModel';
import bcrypt from 'bcryptjs';
import User from '../models/userModels';
async function seed() {
  await connectDB(process.env.MONGO_URI);
  await User.deleteMany({});
  await Conversation.deleteMany({});

  const pw = await bcrypt.hash('password123', 8);

  const alice = new User({ name: 'Alice', email: 'alice@example.com', passwordHash: pw });
  const bob = new User({ name: 'Bob', email: 'bob@example.com', passwordHash: pw });
  await alice.save();
  await bob.save();

  const convo = new Conversation({ participants: [alice._id, bob._id] });
  await convo.save();

  console.log('Seed done:', { alice: alice.email, bob: bob.email, conversationId: convo._id });
  process.exit();
}

seed();
