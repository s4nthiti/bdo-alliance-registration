import { sql } from '@vercel/postgres';

// Set the POSTGRES_URL environment variable if it's not set but BDO_STORAGE_POSTGRES_URL is
if (!process.env.POSTGRES_URL && process.env.BDO_STORAGE_POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.BDO_STORAGE_POSTGRES_URL;
}

// Ensure environment variables are loaded
if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is not set');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('POSTGRES')));
}

export interface Guild {
  id: string;
  name: string;
  registration_code: string;
  mercenary_quotas: number;
  contact_info: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  guild_id: string;
  registration_code: string;
  used_quotas: number;
  boss_date: string;
  created_at: string;
}

// Initialize database tables
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    console.log('POSTGRES_URL available:', !!process.env.POSTGRES_URL);
    
    // Create guilds table
    console.log('Creating guilds table...');
    await sql`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        registration_code TEXT NOT NULL UNIQUE,
        mercenary_quotas INTEGER NOT NULL DEFAULT 0,
        contact_info TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
        registration_code TEXT NOT NULL,
        used_quotas INTEGER NOT NULL DEFAULT 0,
        boss_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Guild operations
export async function getAllGuilds(): Promise<Guild[]> {
  const { rows } = await sql<Guild>`
    SELECT * FROM guilds 
    ORDER BY name ASC
  `;
  return rows;
}

export async function getGuildById(id: string): Promise<Guild | null> {
  const { rows } = await sql<Guild>`
    SELECT * FROM guilds WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createGuild(guild: Omit<Guild, 'id' | 'created_at' | 'updated_at'>): Promise<Guild> {
  const { rows } = await sql<Guild>`
    INSERT INTO guilds (name, registration_code, mercenary_quotas, contact_info)
    VALUES (${guild.name}, ${guild.registration_code}, ${guild.mercenary_quotas}, ${guild.contact_info})
    RETURNING *
  `;
  return rows[0];
}

export async function updateGuild(id: string, updates: Partial<Omit<Guild, 'id' | 'created_at' | 'updated_at'>>): Promise<Guild> {
  const { rows } = await sql<Guild>`
    UPDATE guilds 
    SET 
      name = COALESCE(${updates.name}, name),
      registration_code = COALESCE(${updates.registration_code}, registration_code),
      mercenary_quotas = COALESCE(${updates.mercenary_quotas}, mercenary_quotas),
      contact_info = COALESCE(${updates.contact_info}, contact_info),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteGuild(id: string): Promise<void> {
  await sql`DELETE FROM guilds WHERE id = ${id}`;
}

// Registration operations
export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at'>): Promise<Registration> {
  const { rows } = await sql<Registration>`
    INSERT INTO registrations (guild_id, registration_code, used_quotas, boss_date)
    VALUES (${registration.guild_id}, ${registration.registration_code}, ${registration.used_quotas}, ${registration.boss_date})
    RETURNING *
  `;
  return rows[0];
}

export async function getRegistrationsByDate(bossDate: string): Promise<(Registration & { guild_name: string })[]> {
  const { rows } = await sql<Registration & { guild_name: string }>`
    SELECT r.*, g.name as guild_name
    FROM registrations r
    JOIN guilds g ON r.guild_id = g.id
    WHERE r.boss_date = ${bossDate}
    ORDER BY g.name ASC
  `;
  return rows;
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const { rows } = await sql<Registration>`
    SELECT * FROM registrations WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function updateRegistrationQuotas(id: string, usedQuotas: number): Promise<Registration> {
  const { rows } = await sql<Registration>`
    UPDATE registrations 
    SET used_quotas = ${usedQuotas}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}
