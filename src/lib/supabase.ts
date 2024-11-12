import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema setup
export const setupDatabase = async () => {
  // Users table is automatically created by Supabase Auth

  // Elections table
  await supabase.rpc('create_elections_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS elections (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        is_published BOOLEAN DEFAULT FALSE,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  // Portfolios table
  await supabase.rpc('create_portfolios_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS portfolios (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_yes_no BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  // Candidates table
  await supabase.rpc('create_candidates_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  // Voters table
  await supabase.rpc('create_voters_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS voters (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
        index TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        program TEXT,
        year TEXT,
        otp TEXT,
        otp_expires_at TIMESTAMP WITH TIME ZONE,
        has_voted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(election_id, index)
      );
    `
  });

  // Votes table
  await supabase.rpc('create_votes_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS votes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
        portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(portfolio_id, voter_id)
      );
    `
  });

  // Row Level Security Policies
  await setupRLS();
};

const setupRLS = async () => {
  // Enable RLS on all tables
  const tables = ['elections', 'portfolios', 'candidates', 'voters', 'votes'];
  for (const table of tables) {
    await supabase.rpc('enable_rls', { table_name: table });
  }

  // Elections policies
  await supabase.rpc('create_policy', {
    table_name: 'elections',
    policy_name: 'Elections are viewable by creator',
    policy_definition: `
      CREATE POLICY "Elections are viewable by creator" ON elections
      FOR SELECT USING (auth.uid() = created_by);
    `
  });

  // Similar policies for other tables...
  // Add more policies as needed for each table
};