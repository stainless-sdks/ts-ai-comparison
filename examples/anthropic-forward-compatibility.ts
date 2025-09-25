import Anthropic from "@anthropic-ai/sdk";
import {
  MessageCreateParamsBase,
  MessageCreateParamsNonStreaming,
  Messages,
} from "@anthropic-ai/sdk/resources/messages";

const originalFetch = global.fetch;

const mockResponse: Messages.Message = {
  id: "msg_01ABC123",
  type: "message",
  role: "assistant",
  content: [
    {
      type: "text",
      text: "Hello! Here's a fun TypeScript fact: TypeScript was first released in 2012.",
      citations: null,
    },
  ],
  model: "claude-3-sonnet-20241022",
  // @ts-expect-error
  stop_reason: "new_experimental_stop_reason",
  stop_sequence: null,
  usage: {
    input_tokens: 15,
    output_tokens: 20,
    cache_creation: null,
    cache_creation_input_tokens: null,
    cache_read_input_tokens: null,
    server_tool_use: null,
    service_tier: null,
  },
  // This is the undocumented property we're adding
  undocumented_property: "new feature!",
};

global.fetch = (() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockResponse),
    headers: new Headers({
      "content-type": "application/json",
    }),
  } as Response)) as any;

const anthropic = new Anthropic({
  apiKey: "test-key",
});

async function testAnthropicForwardCompatibility() {
  console.log("=== Anthropic Forward Compatibility Test ===\n");

  try {
    console.log("Test 1: Passing undocumented parameter to request...");
    const requestParams: MessageCreateParamsNonStreaming = {
      model: "claude-3-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user" as const,
          content: "Hello!",
        },
      ],
      // This should be an undocumented parameter
      // @ts-expect-error
      undocumented_param: "test_value",
    };

    const message = await anthropic.messages.create(requestParams);

    console.log("✅ Request with undocumented parameter succeeded");
    console.log("Response ID:", message);

    console.log("\nTest 2: Accessing undocumented property from response...");

    // @ts-expect-error
    if (message.undocumented_property === "new feature!") {
      console.log("✅ Undocumented property found in response:");
    } else {
      console.log("❌ Undocumented property not found in response");
    }

    console.log("\nTest 3: Testing new enum values...");
    console.log("Stop reason:", message.stop_reason);
    console.log("Stop reason type:", typeof message.stop_reason);

    if ((message.stop_reason as any) === "new_experimental_stop_reason") {
      console.log("✅ SDK accepts new enum values without breaking");
    } else {
      console.log("❌ SDK may have transformed or rejected the new enum value");
      console.log("  Actual value received:", message.stop_reason);
    }
  } catch (error) {
    console.error("❌ Error during forward compatibility test:", error);
  }
}

if (require.main === module) {
  testAnthropicForwardCompatibility().finally(() => {
    global.fetch = originalFetch;
  });
}
