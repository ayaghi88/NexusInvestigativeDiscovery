export interface Entity {
  id: string;
  name?: string;
  address?: string;
  context?: string;
  phone?: string;
}

export interface Connection {
  sourceId: string;
  targetId: string;
  type: 'address' | 'employer' | 'social' | 'other';
  description: string;
  evidence: string;
  url?: string;
  confidence: number;
}

export interface AnalysisResult {
  entities: Entity[];
  connections: Connection[];
  summary: string;
  overlaps?: {
    type: string;
    value: string;
    entities: string[];
    description: string;
  }[];
}
