import { Mistral } from "@mistralai/mistralai";
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "@mistralai/mistralai/models/components";

// Mock the fetch function to add undocumented properties to the response
const originalFetch = global.fetch;

const mockResponse: ChatCompletionResponse = {
  id: "cmpl-abc123",
  object: "chat.completion",
  created: 1699896916,
  model: "mistral-small-latest",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content:
          "Hello! Here's a TypeScript fact: It adds static typing to JavaScript!",
      },
      // @ts-expect-error
      finish_reason: "new_experimental_finish",
    },
  ],
  usage: {
    promptTokens: 15,
    completionTokens: 20,
    totalTokens: 35,
  },
  // This is the undocumented property we're adding
  undocumented_property: "new feature!",
};

global.fetch = (() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockResponse),
    text: () => Promise.resolve(JSON.stringify(mockResponse)),
    headers: new Headers({
      "content-type": "application/json",
    }),
  } as Response)) as any;

const mistral = new Mistral({
  apiKey: "test-key",
});

async function testMistralForwardCompatibility() {
  console.log("=== Mistral Forward Compatibility Test ===\n");

  try {
    console.log("Test 1: Passing undocumented parameter to request...");
    const requestParams: ChatCompletionRequest = {
      model: "mistral-small-latest",
      messages: [
        {
          role: "user" as const,
          content: "Hello!",
        },
      ],
      maxTokens: 1024,
      // @ts-expect-error
      undocumented_param: "test_value",
      experimental_feature: true,
    };

    const response = await mistral.chat.complete(requestParams);

    console.log("✅ Request with undocumented parameter succeeded");
    console.log("Response ID:", response.id);

    console.log("\nTest 2: Accessing undocumented property from response...");

    const responseAny = response as any;
    if (responseAny.undocumented_property) {
      console.log("✅ Undocumented property found in response:");
      console.log(
        "  new_feature:",
        responseAny.undocumented_property.new_feature
      );
      console.log(
        "  experimental_data:",
        responseAny.undocumented_property.experimental_data
      );
    } else {
      console.log("❌ Undocumented property not found in response");
    }

    console.log("\nTest 3: Testing new enum values...");
    console.log("Finish reason:", response.choices[0].finishReason);
    console.log("Finish reason type:", typeof response.choices[0].finishReason);

    if (response.choices[0].finishReason === "new_experimental_finish") {
      console.log("✅ SDK accepts new enum values without breaking");
    } else {
      console.log("❌ SDK may have transformed or rejected the new enum value");
      console.log("  Actual value received:", response.choices[0].finishReason);
    }
  } catch (error) {
    console.error("❌ Error during forward compatibility test:", error);
  }
}

if (require.main === module) {
  testMistralForwardCompatibility().finally(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });
}
