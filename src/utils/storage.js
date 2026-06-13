// src/utils/storage.js
// LocalStorage helpers for settings and chat history

const KEYS = {
  SETTINGS: 'jarbai_settings',
  CHATS: 'jarbai_chats',
  ACTIVE_CHAT: 'jarbai_active_chat',
};

// ─── Settings ───────────────────────────────────────────────────────────────

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getSetting(key, defaultValue = null) {
  return getSettings()[key] ?? defaultValue;
}

export function setSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
}

// ─── Chat History ────────────────────────────────────────────────────────────

export function getAllChats() {
  try {
    const raw = localStorage.getItem(KEYS.CHATS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getChatById(id) {
  return getAllChats().find((c) => c.id === id) || null;
}

export function saveChat(chat) {
  const chats = getAllChats();
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    chats[idx] = chat;
  } else {
    chats.unshift(chat);
  }
  localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
}

export function deleteChat(id) {
  const chats = getAllChats().filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
}

export function clearAllChats() {
  localStorage.removeItem(KEYS.CHATS);
  localStorage.removeItem(KEYS.ACTIVE_CHAT);
}

export function createNewChat(modelId) {
  return {
    id: `chat_${Date.now()}`,
    title: 'New Chat',
    modelId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    folder: null,
  };
}

export function getActiveChat() {
  return localStorage.getItem(KEYS.ACTIVE_CHAT);
}

export function setActiveChat(id) {
  localStorage.setItem(KEYS.ACTIVE_CHAT, id);
}
