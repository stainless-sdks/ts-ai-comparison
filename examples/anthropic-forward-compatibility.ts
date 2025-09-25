import Anthropic from "@anthropic-ai/sdk";

// Mock the fetch function to add undocumented properties to the response
const originalFetch = global.fetch;

const mockResponse = {
  id: "msg_01ABC123",
  type: "message",
  role: "assistant",
  content: [
    {
      type: "text",
      text: "Hello! Here's a fun TypeScript fact: TypeScript was first released in 2012.",
    },
  ],
  model: "claude-3-sonnet-20241022",
  stop_reason: "new_experimental_stop_reason",
  stop_sequence: null,
  usage: {
    input_tokens: 15,
    output_tokens: 20,
  },
  // This is the undocumented property we're adding
  undocumented_property: {
    new_feature: "This is a new feature from the API",
    experimental_data: [1, 2, 3, 4, 5],
  },
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
    // Test 1: Try to pass undocumented parameter
    console.log("Test 1: Passing undocumented parameter to request...");
    const requestParams = {
      model: "claude-3-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user" as const,
          content: "Hello!",
        },
      ],
      // This should be an undocumented parameter
      undocumented_param: "test_value",
    };

    // Type assertion to bypass TypeScript checking for undocumented params
    const message = await anthropic.messages.create(requestParams);

    console.log("✅ Request with undocumented parameter succeeded");
    console.log("Response ID:", message.id);

    // Test 2: Try to access undocumented property from response
    console.log("\nTest 2: Accessing undocumented property from response...");

    // Check if the undocumented property exists
    const messageAny = message as any;
    if (messageAny.undocumented_property) {
      console.log("✅ Undocumented property found in response:");
      console.log(
        "  new_feature:",
        messageAny.undocumented_property.new_feature
      );
      console.log(
        "  experimental_data:",
        messageAny.undocumented_property.experimental_data
      );
    } else {
      console.log("❌ Undocumented property not found in response");
    }

    // Test 3: Check if new enum values break the SDK
    console.log("\nTest 3: Testing new enum values...");
    console.log("Stop reason:", message.stop_reason);
    console.log("Stop reason type:", typeof message.stop_reason);

    // Try to use the stop_reason in a conditional (this would break if SDK validates enums strictly)
    if (message.stop_reason === "new_experimental_stop_reason") {
      console.log("✅ SDK accepts new enum values without breaking");
    } else {
      console.log("❌ SDK may have transformed or rejected the new enum value");
      console.log("  Actual value received:", message.stop_reason);
    }

  } catch (error) {
    console.error("❌ Error during forward compatibility test:", error);
  }
}

// Simple mock implementation without jest

if (require.main === module) {
  testAnthropicForwardCompatibility().finally(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });
}
