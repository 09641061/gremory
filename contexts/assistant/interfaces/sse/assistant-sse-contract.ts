import { z } from "zod";

/**
 * BFF-owned subset of the upstream Assistant SSE protocol. The backend
 * contract is still an unknown; these names match the events consumed by the
 * current client (`status` and `message`) and reserve stable terminal/error
 * events for the boundary.
 */
export const ASSISTANT_SSE_EVENT_NAMES = [
  "status",
  "message",
  "error",
  "done",
] as const;

export const ASSISTANT_SSE_MAX_DATA_BYTES = 64 * 1024;

export const assistantSseEventNameSchema = z.enum(ASSISTANT_SSE_EVENT_NAMES);
const assistantSsePayloadSchema = z.union([
  z.string().max(ASSISTANT_SSE_MAX_DATA_BYTES),
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
  z.null(),
]);

export type AssistantSseEventName = (typeof ASSISTANT_SSE_EVENT_NAMES)[number];
export type AssistantSsePayload = z.infer<typeof assistantSsePayloadSchema>;
export type AssistantSseEvent = Readonly<{
  event: AssistantSseEventName;
  data: AssistantSsePayload;
}>;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Parse one complete SSE frame (without the terminating blank line). */
export function parseAssistantSseFrame(frame: string): AssistantSseEvent {
  if (encoder.encode(frame).byteLength > ASSISTANT_SSE_MAX_DATA_BYTES) {
    throw new AssistantSseContractError("Assistant stream event is too large");
  }

  let event: string = "message";
  const dataLines: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).replace(/^ /, ""));
    }
  }

  const eventName = assistantSseEventNameSchema.parse(event);
  const rawData = dataLines.join("\n");
  if (encoder.encode(rawData).byteLength > ASSISTANT_SSE_MAX_DATA_BYTES) {
    throw new AssistantSseContractError("Assistant stream payload is too large");
  }

  let data: unknown = rawData;
  if (rawData === "" && eventName === "done") {
    data = null;
  } else {
    try {
      data = JSON.parse(rawData) as unknown;
    } catch {
      // The current upstream sends status/message as plain text. Preserve that
      // form; object/array payloads are still parsed and schema-checked.
      data = rawData;
    }
  }

  const payload = assistantSsePayloadSchema.parse(data);
  return { event: eventName, data: payload };
}

export function serializeAssistantSseEvent(event: AssistantSseEvent): Uint8Array {
  const data = typeof event.data === "string" ? event.data : JSON.stringify(event.data);
  const frame = `event: ${event.event}\ndata: ${data}\n\n`;
  if (encoder.encode(frame).byteLength > ASSISTANT_SSE_MAX_DATA_BYTES) {
    throw new AssistantSseContractError("Assistant stream event is too large");
  }
  return encoder.encode(frame);
}

/**
 * Validates and forwards upstream frames. After headers have been sent a
 * protocol error cannot change the HTTP status, so the BFF emits a stable
 * redacted `error` event followed by `done` and closes the stream.
 */
export function createValidatedAssistantSseStream(
  body: ReadableStream<Uint8Array>,
): ReadableStream<Uint8Array> {
  const reader = body.getReader();
  const outputEncoder = new TextEncoder();
  let buffer = "";
  let closed = false;

  const emitProtocolError = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return;
    closed = true;
    controller.enqueue(
      serializeAssistantSseEvent({
        event: "error",
        data: { message: "Assistant stream protocol error" },
      }),
    );
    controller.enqueue(serializeAssistantSseEvent({ event: "done", data: null }));
    void reader.cancel();
    controller.close();
  };

  const processFrames = (controller: ReadableStreamDefaultController<Uint8Array>) => {
    while (!closed) {
      const match = buffer.match(/\r?\n\r?\n/);
      if (!match || match.index === undefined) break;
      const frame = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);
      try {
        controller.enqueue(serializeAssistantSseEvent(parseAssistantSseFrame(frame)));
      } catch {
        emitProtocolError(controller);
      }
    }
    if (!closed && outputEncoder.encode(buffer).byteLength > ASSISTANT_SSE_MAX_DATA_BYTES) {
      emitProtocolError(controller);
    }
  };

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (closed) return;
      try {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.trim()) {
            try {
              controller.enqueue(serializeAssistantSseEvent(parseAssistantSseFrame(buffer)));
            } catch {
              emitProtocolError(controller);
              return;
            }
          }
          closed = true;
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        processFrames(controller);
      } catch {
        emitProtocolError(controller);
      }
    },
    cancel(reason) {
      closed = true;
      return reader.cancel(reason);
    },
  });
}

export class AssistantSseContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssistantSseContractError";
  }
}
