import Dexie, { Table } from 'dexie';

export interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  projectId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  feedback?: 'thumbs_up' | 'thumbs_down';
  artifacts?: Artifact[];
  thinking?: string;
  agentSteps?: AgentStep[];
}

export interface Artifact {
  id: string;
  type: 'html' | 'svg' | 'markdown' | 'mermaid' | 'code';
  title: string;
  content: string;
  language?: string;
  createdAt: number;
}

export interface AgentStep {
  id: string;
  toolName: string;
  input: unknown;
  output?: unknown;
  status: 'running' | 'success' | 'error' | 'pending_approval';
  startTime: number;
  endTime?: number;
  error?: string;
}

export interface Project {
  id: string;
  name: string;
  instructions?: string;
  contextFiles?: ProjectFile[];
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  mimeType: string;
  size: number;
}

export interface Attachment {
  id: string;
  conversationId: string;
  messageId: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
}

export interface Settings {
  id: string; // Always 'global'
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  customInstructions?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
}

export class OrbitDatabase extends Dexie {
  conversations!: Table<Conversation, string>;
  messages!: Table<Message, string>;
  projects!: Table<Project, string>;
  attachments!: Table<Attachment, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('KiLiAgent');

    this.version(1).stores({
      conversations: 'id, createdAt, updatedAt, pinned, projectId',
      messages: 'id, conversationId, createdAt',
      projects: 'id, createdAt, updatedAt',
      attachments: 'id, conversationId, messageId, createdAt',
      settings: 'id',
    });
  }
}

export const db = new OrbitDatabase();

// Initialize default settings
db.on('ready', async () => {
  const existingSettings = await db.settings.get('global');
  if (!existingSettings) {
    await db.settings.add({
      id: 'global',
      theme: 'system',
      language: 'id',
    });
  }
});
