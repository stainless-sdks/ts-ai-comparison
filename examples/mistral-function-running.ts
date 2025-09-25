#!/usr/bin/env -S npm run tsn -T

import { Mistral } from "@mistralai/mistralai";

const client = new Mistral();

const getWeatherTool = {
  type: "function" as const,
  function: {
    name: "getWeather",
    description: "Get the weather at a specific location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g. San Francisco, CA",
        },
      },
      required: ["location"],
    },
  },
};

const tools = {
  getWeather: ({ location }: { location: string }) => {
    return `The weather is foggy with a temperature of 20°C in ${location}.`;
  },
};

async function main() {
  const response = await client.chat.complete({
    messages: [
      {
        role: "user",
        content: `What is the weather in SF?`,
      },
    ],
    tools: [getWeatherTool],
    model: "mistral-small-latest",
    maxTokens: 1024,
    toolChoice: "auto",
  });

  const choice = response.choices[0];

  if (choice.message.toolCalls && choice.message.toolCalls.length > 0) {
    const toolCall = choice.message.toolCalls[0];
    const toolName = toolCall.function.name as keyof typeof tools;

    const args =
      typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;

    const toolResult = tools[toolName](args);

    const finalResponse = await client.chat.complete({
      messages: [
        {
          role: "user",
          content: `What is the weather in SF?`,
        },
        {
          role: "assistant",
          content: choice.message.content || "",
          toolCalls: choice.message.toolCalls,
        },
        {
          role: "tool",
          name: toolCall.function.name,
          content: toolResult,
          toolCallId: toolCall.id,
        },
      ],
      tools: [getWeatherTool],
      model: "mistral-small-latest",
      maxTokens: 1024,
    });

    console.log("Final response:", finalResponse.choices[0].message.content);
  } else {
    console.log("Direct response:", choice.message.content);
  }
}

main();
