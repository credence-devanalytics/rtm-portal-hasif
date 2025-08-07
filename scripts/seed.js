import { db } from '../src/lib/db/index.js';
import { mentions, users } from '../src/lib/schema.js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Seed sample users
    const sampleUsers = [
      { name: 'Admin User', email: 'admin@example.com' },
      { name: 'Analytics User', email: 'analytics@example.com' },
    ];

    console.log('Seeding users...');
    for (const user of sampleUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }

    // Check if CSV file exists and seed mentions
    const csvPath = path.join(__dirname, '../public/data/combined_classify_mentions.csv');
    
    try {
      const csvData = readFileSync(csvPath, 'utf-8');
      const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true
      });

      console.log(`Found ${records.length} records in CSV. Seeding mentions...`);

      // Process records in batches to avoid overwhelming the database
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const mentionsData = batch.map(record => ({
          platform: record.platform || record.Platform,
          sentiment: record.sentiment || record.Sentiment,
          content: record.content || record.Content || record.text,
          author: record.author || record.Author,
          date: record.date ? new Date(record.date) : new Date(),
          likes: parseInt(record.likes || record.Likes || 0),
          shares: parseInt(record.shares || record.Shares || 0),
          comments: parseInt(record.comments || record.Comments || 0),
          reach: parseInt(record.reach || record.Reach || 0),
          engagement: parseFloat(record.engagement || record.Engagement || 0),
        }));

        await db.insert(mentions).values(mentionsData).onConflictDoNothing();
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
      }

    } catch (error) {
      console.log('CSV file not found or error reading CSV. Seeding with sample data...');
      
      // Seed with sample mentions data
      const sampleMentions = [
        {
          platform: 'Twitter',
          sentiment: 'positive',
          content: 'Great service from MOH!',
          author: 'user1',
          date: new Date(),
          likes: 15,
          shares: 3,
          comments: 2,
          reach: 500,
          engagement: 4.0
        },
        {
          platform: 'Facebook',
          sentiment: 'negative',
          content: 'Not satisfied with the response time',
          author: 'user2',
          date: new Date(),
          likes: 2,
          shares: 1,
          comments: 8,
          reach: 200,
          engagement: 5.5
        },
        {
          platform: 'Instagram',
          sentiment: 'neutral',
          content: 'MOH announcement about new policies',
          author: 'user3',
          date: new Date(),
          likes: 25,
          shares: 5,
          comments: 3,
          reach: 800,
          engagement: 4.1
        }
      ];

      await db.insert(mentions).values(sampleMentions).onConflictDoNothing();
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
