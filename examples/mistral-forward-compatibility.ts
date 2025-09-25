import { Mistral } from '@mistralai/mistralai';

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
        content: "Hello! Here's a TypeScript fact: It adds static typing to JavaScript!"
      },
      finish_reason: "stop"
    }
  ],
  usage: {
    prompt_tokens: 15,
    completion_tokens: 20,
    total_tokens: 35
  },
  // This is the undocumented property we're adding
  undocumented_property: {
    new_feature: "This is a new feature from the Mistral API",
    experimental_data: {
      confidence_score: 0.95,
      processing_time_ms: 150
    }
  }
};

global.fetch = (() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockResponse),
    text: () => Promise.resolve(JSON.stringify(mockResponse)),
    headers: new Headers({
      'content-type': 'application/json'
    })
  } as Response)
) as any;

const mistral = new Mistral({
  apiKey: 'test-key'
});

async function testMistralForwardCompatibility() {
  console.log('=== Mistral Forward Compatibility Test ===\n');

  try {
    // Test 1: Try to pass undocumented parameter
    console.log('Test 1: Passing undocumented parameter to request...');
    const requestParams = {
      model: 'mistral-small-latest',
      messages: [{
        role: 'user' as const,
        content: 'Hello!'
      }],
      max_tokens: 1024,
      // This should be an undocumented parameter
      undocumented_param: 'test_value',
      experimental_feature: true
    };

    // Type assertion to bypass TypeScript checking for undocumented params
    const response = await mistral.chat.complete(requestParams as any);

    console.log('✅ Request with undocumented parameter succeeded');
    console.log('Response ID:', response.id);

    // Test 2: Try to access undocumented property from response
    console.log('\nTest 2: Accessing undocumented property from response...');

    // Check if the undocumented property exists
    const responseAny = response as any;
    if (responseAny.undocumented_property) {
      console.log('✅ Undocumented property found in response:');
      console.log('  new_feature:', responseAny.undocumented_property.new_feature);
      console.log('  experimental_data:', responseAny.undocumented_property.experimental_data);
    } else {
      console.log('❌ Undocumented property not found in response');
    }

    // Test 3: Check if TypeScript types are preserved
    console.log('\nTest 3: Checking TypeScript type safety...');
    console.log('Response object:', response.object);
    console.log('First choice role:', response.choices[0].message.role);
    console.log('✅ TypeScript types work correctly for documented properties');

    // Test 4: Check the raw response object
    console.log('\nTest 4: Inspecting full response object...');
    console.log('All response keys:', Object.keys(response));

    // Test 5: Check if we can access nested undocumented properties
    console.log('\nTest 5: Accessing nested undocumented properties...');
    if (responseAny.undocumented_property?.experimental_data?.confidence_score) {
      console.log('✅ Nested undocumented property accessible:');
      console.log('  confidence_score:', responseAny.undocumented_property.experimental_data.confidence_score);
      console.log('  processing_time_ms:', responseAny.undocumented_property.experimental_data.processing_time_ms);
    } else {
      console.log('❌ Nested undocumented properties not accessible');
    }

  } catch (error) {
    console.error('❌ Error during forward compatibility test:', error);
  }
}

// Simple mock implementation without jest

if (require.main === module) {
  testMistralForwardCompatibility().finally(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });
}