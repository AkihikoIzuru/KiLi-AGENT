import { db, type Conversation, type Message } from '@/lib/db/dexie';

export async function exportConversationToMarkdown(conversationId: string): Promise<string> {
  const conversation = await db.conversations.get(conversationId);
  const messages = await db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('createdAt');

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const title = conversation.title || 'Percakapan';
  const date = new Date(conversation.createdAt).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  let markdown = `# ${title}\n\n`;
  markdown += `**Tanggal**: ${date}  \n`;
  markdown += `**Model**: ${conversation.model}\n\n`;
  markdown += `---\n\n`;

  for (const message of messages) {
    const role = message.role === 'user' ? '👤 **Anda**' : '🤖 **Asisten**';
    const timestamp = new Date(message.createdAt).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    markdown += `### ${role} · ${timestamp}\n\n`;
    markdown += `${message.content}\n\n`;
    markdown += `---\n\n`;
  }

  markdown += `\n*Diekspor dari KiLi AGENT pada ${new Date().toLocaleString('id-ID')}*\n`;

  return markdown;
}

export async function downloadMarkdown(conversationId: string) {
  try {
    const markdown = await exportConversationToMarkdown(conversationId);
    const conversation = await db.conversations.get(conversationId);

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation?.title || 'conversation'}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export conversation:', error);
    throw error;
  }
}

export async function exportAllData() {
  try {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      conversations: await db.conversations.toArray(),
      messages: await db.messages.toArray(),
      projects: await db.projects.toArray(),
      settings: await db.settings.toArray(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kili-agent-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

export async function importData(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.version || !data.conversations || !data.messages) {
      throw new Error('Invalid backup file format');
    }

    // Import conversations
    for (const conv of data.conversations) {
      await db.conversations.put(conv);
    }

    // Import messages
    for (const msg of data.messages) {
      await db.messages.put(msg);
    }

    // Import projects if present
    if (data.projects) {
      for (const proj of data.projects) {
        await db.projects.put(proj);
      }
    }

    // Import settings if present
    if (data.settings) {
      for (const setting of data.settings) {
        await db.settings.put(setting);
      }
    }

    return {
      conversations: data.conversations.length,
      messages: data.messages.length,
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw error;
  }
}
