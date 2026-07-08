import * as SecureStore from 'expo-secure-store';

// SecureStore caps a single value at ~2048 bytes on Android; a Supabase
// session (access token + refresh token + user metadata) runs 3-5KB.
// Writing it directly truncates silently and the session never restores.
// This adapter splits the value into chunks stored under `${key}.0`,
// `${key}.1`, ... plus a `${key}.meta` entry recording the chunk count.
const CHUNK_SIZE = 1900;

async function getChunkCount(key: string): Promise<number> {
  const meta = await SecureStore.getItemAsync(`${key}.meta`);
  return meta ? parseInt(meta, 10) : 0;
}

export const chunkedSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const count = await getChunkCount(key);
    if (count === 0) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    const previousCount = await getChunkCount(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.${i}`, chunk)));
    await SecureStore.setItemAsync(`${key}.meta`, String(chunks.length));
    for (let i = chunks.length; i < previousCount; i++) {
      await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
  },

  async removeItem(key: string): Promise<void> {
    const count = await getChunkCount(key);
    for (let i = 0; i < count; i++) {
      await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
    await SecureStore.deleteItemAsync(`${key}.meta`);
  },
};
