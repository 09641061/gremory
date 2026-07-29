import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

const assistantConversationsEndpoint = "/api/assistant/conversations";

type CacheState = {
  conversations: AssistantConversationSummaryReadModel[];
  loaded: boolean;
  isLoading: boolean;
  error: string | null;
};

type CacheListener = () => void;

let state: CacheState = {
  conversations: [],
  loaded: false,
  isLoading: false,
  error: null,
};

let loadPromise: Promise<AssistantConversationSummaryReadModel[]> | null = null;
const listeners = new Set<CacheListener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function readErrorMessage(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let parsed: unknown;

  try {
    parsed = text ? (JSON.parse(text) as unknown) : undefined;
  } catch {
    parsed = text;
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(parsed, `Request failed with status ${response.status}`));
  }

  return parsed as T;
}

export function getAssistantConversationListCache() {
  return {
    conversations: state.conversations,
    loaded: state.loaded,
    isLoading: state.isLoading,
    error: state.error,
  };
}

export async function ensureAssistantConversationListCached(): Promise<AssistantConversationSummaryReadModel[]> {
  if (state.loaded) {
    return state.conversations;
  }

  if (loadPromise) {
    return loadPromise;
  }

  state = {
    ...state,
    isLoading: true,
    error: null,
  };
  emitChange();

  loadPromise = (async () => {
    try {
      const data = await requestJson<{ content?: AssistantConversationSummaryReadModel[] }>(
        `${assistantConversationsEndpoint}?page=0&size=20`,
      );

      state = {
        conversations: data.content ?? [],
        loaded: true,
        isLoading: false,
        error: null,
      };
      emitChange();
      return state.conversations;
    } catch (error) {
      state = {
        ...state,
        conversations: [],
        loaded: false,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "No pudimos cargar los chats.",
      };
      emitChange();
      throw error;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function setAssistantConversationListCache(conversations: AssistantConversationSummaryReadModel[]) {
  state = {
    conversations: [...conversations],
    loaded: true,
    isLoading: false,
    error: null,
  };
  emitChange();
}

export function subscribeAssistantConversationListCache(listener: CacheListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function upsertAssistantConversationListItem(
  conversation: AssistantConversationSummaryReadModel,
  options: { moveToFront?: boolean; markLoaded?: boolean } = {},
) {
  const { moveToFront = false, markLoaded = false } = options;
  const currentIndex = state.conversations.findIndex((item) => item.id === conversation.id);

  let conversations = state.conversations.filter((item) => item.id !== conversation.id);

  if (moveToFront) {
    conversations = [conversation, ...conversations];
  } else if (currentIndex >= 0) {
    conversations.splice(currentIndex, 0, conversation);
  } else {
    conversations.push(conversation);
  }

  state = {
    ...state,
    conversations,
    loaded: state.loaded || markLoaded,
    error: null,
  };
  emitChange();
}

export function removeAssistantConversationListItem(id: string) {
  state = {
    ...state,
    conversations: state.conversations.filter((item) => item.id !== id),
    error: null,
  };
  emitChange();
}

export function patchAssistantConversationListItemTitle(id: string, title: string) {
  state = {
    ...state,
    conversations: state.conversations.map((item) =>
      item.id === id ? { ...item, title } : item,
    ),
    error: null,
  };
  emitChange();
}
