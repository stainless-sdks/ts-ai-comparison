import { Mistral } from "@mistralai/mistralai";

// Mock the fetch function to add undocumented properties to the response
const originalFetch = global.fetch;

const mockResponse = {
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
      finish_reason: "new_experimental_finish",
    },
  ],
  usage: {
    prompt_tokens: 15,
    completion_tokens: 20,
    total_tokens: 35,
  },
  // This is the undocumented property we're adding
  undocumented_property: {
    new_feature: "This is a new feature from the Mistral API",
    experimental_data: {
      confidence_score: 0.95,
      processing_time_ms: 150,
    },
  },
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
    // Test 1: Try to pass undocumented parameter
    console.log("Test 1: Passing undocumented parameter to request...");
    const requestParams = {
      model: "mistral-small-latest",
      messages: [
        {
          role: "user" as const,
          content: "Hello!",
        },
      ],
      max_tokens: 1024,
      // This should be an undocumented parameter
      undocumented_param: "test_value",
      experimental_feature: true,
    };

    // Type assertion to bypass TypeScript checking for undocumented params
    const response = await mistral.chat.complete(requestParams);

    console.log("✅ Request with undocumented parameter succeeded");
    console.log("Response ID:", response.id);

    // Test 2: Try to access undocumented property from response
    console.log("\nTest 2: Accessing undocumented property from response...");

    // Check if the undocumented property exists
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

    // Test 3: Check if new enum values break the SDK
    console.log("\nTest 3: Testing new enum values...");
    console.log("Finish reason:", response.choices[0].finish_reason);
    console.log("Finish reason type:", typeof response.choices[0].finish_reason);

    // Try to use the finish_reason in a conditional
    if (response.choices[0].finish_reason === "new_experimental_finish") {
      console.log("✅ SDK accepts new enum values without breaking");
    } else {
      console.log("❌ SDK may have transformed or rejected the new enum value");
      console.log("  Actual value received:", response.choices[0].finish_reason);
    }

  } catch (error) {
    console.error("❌ Error during forward compatibility test:", error);
  }
}

// Simple mock implementation without jest

if (require.main === module) {
  testMistralForwardCompatibility().finally(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });
}
