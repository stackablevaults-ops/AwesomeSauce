import { pgTable, serial, varchar, boolean, timestamp, integer, text, real } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Agents table with enhanced marketplace features
export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 64 }),
  price: real('price').default(0),
  rating: real('rating').default(0),
  downloads: integer('downloads').default(0),
  ownerId: integer('owner_id'),
  
  // AI Configuration
  systemPrompt: text('system_prompt'),
  model: varchar('model', { length: 64 }).default('gpt-3.5-turbo'),
  temperature: real('temperature').default(0.7),
  maxTokens: integer('max_tokens').default(500),
  
  // Legacy fields for backward compatibility
  provider: varchar('provider', { length: 64 }),
  status: varchar('status', { length: 32 }).default('active'),
  isActive: boolean('is_active').default(true),
  skills: varchar('skills', { length: 256 }),
  specialties: varchar('specialties', { length: 256 }),
  trainingDataUrl: varchar('training_data_url', { length: 256 }),
  pricing: varchar('pricing', { length: 32 }),
  readyForSale: boolean('ready_for_sale').default(false),
  inStock: boolean('in_stock').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Training data table
export const trainingData = pgTable('training_data', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull(),
  input: text('input').notNull(),
  expectedOutput: text('expected_output').notNull(),
  context: text('context'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Feedback table with enhanced structure
export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull(),
  userId: integer('user_id').notNull(),
  rating: integer('rating').notNull(), // 1-5 star rating
  comment: text('comment'),
  score: integer('score'), // Legacy field
  feedback: text('feedback'), // Legacy field
  createdAt: timestamp('created_at').defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: integer('agent_id').notNull(),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  priceId: varchar('price_id', { length: 255 }),
  subscriptionId: varchar('subscription_id', { length: 255 }),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Type definitions
export type User = {
  id: number;
  email: string;
  password: string;
  name?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Agent = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  rating?: number;
  downloads?: number;
  ownerId?: number;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string;
  status?: string;
  isActive?: boolean;
  skills?: string;
  specialties?: string;
  trainingDataUrl?: string;
  pricing?: string;
  readyForSale?: boolean;
  inStock?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TrainingData = {
  id: number;
  agentId: number;
  input: string;
  expectedOutput: string;
  context?: string;
  version?: number;
  createdAt?: Date;
};

export type Feedback = {
  id: number;
  agentId: number;
  userId: number;
  rating: number;
  comment?: string;
  score?: number;
  feedback?: string;
  createdAt?: Date;
};

export type Subscription = {
  id: number;
  userId: number;
  agentId: number;
  plan: string;
  status?: string;
  priceId?: string;
  subscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
