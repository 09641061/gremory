import { describe, expect, it } from "vitest";
import {
  ASSISTANT_SSE_MAX_DATA_BYTES,
  AssistantSseContractError,
  createValidatedAssistantSseStream,
  parseAssistantSseFrame,
} from "@/contexts/assistant/interfaces/sse/assistant-sse-contract";

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return output;
    output += decoder.decode(value, { stream: true });
  }
}

describe("assistant SSE contract", () => {
  it("accepts the plain-text status/message events used by the client", () => {
    expect(parseAssistantSseFrame("event: status\ndata: Generating response...")).toEqual({
      event: "status",
      data: "Generating response...",
    });
    expect(parseAssistantSseFrame("event: message\ndata: final answer")).toEqual({
      event: "message",
      data: "final answer",
    });
  });

  it("parses structured JSON payloads and the terminal event", () => {
    expect(parseAssistantSseFrame('event: message\ndata: {"content":"hello"}')).toEqual({
      event: "message",
      data: { content: "hello" },
    });
    expect(parseAssistantSseFrame("event: done")).toEqual({ event: "done", data: null });
  });

  it("rejects unexpected event names and oversized payloads", () => {
    expect(() => parseAssistantSseFrame("event: secret\ndata: nope")).toThrow();
    expect(() => parseAssistantSseFrame(`event: message\ndata: ${"x".repeat(ASSISTANT_SSE_MAX_DATA_BYTES + 1)}`)).toThrow(
      AssistantSseContractError,
    );
  });

  it("converts malformed upstream frames into a stable redacted error and done event", async () => {
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("event: private\ndata: leaked\n\n"));
        controller.close();
      },
    });

    const output = await readStream(createValidatedAssistantSseStream(upstream));
    expect(output).toContain("event: error");
    expect(output).toContain("Assistant stream protocol error");
    expect(output).toContain("event: done");
    expect(output).not.toContain("leaked");
  });

  it("rejects an unterminated oversized frame before buffering unbounded data", async () => {
    const upstream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(`event: message\ndata: ${"x".repeat(ASSISTANT_SSE_MAX_DATA_BYTES + 10)}`),
        );
        controller.close();
      },
    });

    const output = await readStream(createValidatedAssistantSseStream(upstream));
    expect(output).toContain("event: error");
    expect(output).not.toContain("x".repeat(100));
  });
});
