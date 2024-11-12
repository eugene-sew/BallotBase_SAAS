export interface User {
  id: string;
  email: string;
  planType: 'basic' | 'premium';
}

export interface Election {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  electionId: string;
  title: string;
  is_yes_no: boolean;
  createdAt: string;
}

export interface Candidate {
  id: string;
  portfolioId: string;
  name: string;
  image_url: string;
  created_at: string;
}

export interface Voter {
  id: string;
  electionId: string;
  index: string;
  name: string;
  phone: string;
  program: string;
  year: string;
  has_voted: boolean;
  createdAt: string;
  is_verified: boolean;
}

export interface Vote {
  id: string;
  election_id: string;
  portfolio_id: string;
  candidate_id: string;
  voter_id: string;
  createdAt: string;
}