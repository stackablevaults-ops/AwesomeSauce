import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Extract the file path from the DATABASE_URL
const dbPath = process.env.DATABASE_URL.replace('file:', '');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Demo: Seed occupational models (for dev only)
export async function seedOccupationalModels() {
  const demoModels = [
    {
      name: 'Legal Advisor AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Legal Reasoning', specialties: 'Legal', trainingDataUrl: '', pricing: '$199', readyForSale: true, inStock: true
    },
    {
      name: 'Medical Consultant AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Diagnosis', specialties: 'Medical', trainingDataUrl: '', pricing: '$299', readyForSale: true, inStock: true
    },
    {
      name: 'Financial Analyst AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Finance', specialties: 'Finance', trainingDataUrl: '', pricing: '$249', readyForSale: true, inStock: true
    },
    {
      name: 'Education Tutor AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Teaching', specialties: 'Education', trainingDataUrl: '', pricing: '$99', readyForSale: true, inStock: true
    },
    {
      name: 'Real Estate Advisor AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Property Analysis', specialties: 'Real Estate', trainingDataUrl: '', pricing: '$149', readyForSale: true, inStock: true
    },
    {
      name: 'HR Specialist AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Recruitment', specialties: 'HR', trainingDataUrl: '', pricing: '$129', readyForSale: true, inStock: true
    },
    {
      name: 'Marketing Strategist AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Marketing', specialties: 'Marketing', trainingDataUrl: '', pricing: '$179', readyForSale: true, inStock: true
    },
    {
      name: 'IT Support AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Tech Support', specialties: 'IT', trainingDataUrl: '', pricing: '$89', readyForSale: true, inStock: true
    },
    {
      name: 'Construction Project AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Project Management', specialties: 'Construction', trainingDataUrl: '', pricing: '$159', readyForSale: true, inStock: true
    },
    {
      name: 'Retail Operations AI', provider: 'custom', status: 'active', isActive: true, skills: 'NLP,Retail Analytics', specialties: 'Retail', trainingDataUrl: '', pricing: '$119', readyForSale: true, inStock: true
    }
  ];
  
  try {
    for (const model of demoModels) {
      await db.insert(schema.agents).values(model);
    }
    console.log('Successfully seeded occupational models');
  } catch (error) {
    console.log('Models may already exist, skipping seed');
  }
}