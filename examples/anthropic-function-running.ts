#!/usr/bin/env -S npm run tsn -T

import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const client = new Anthropic();

const getWeatherTool = betaZodTool({
  name: "getWeather",
  description: "Get the weather at a specific location",
  inputSchema: z.object({
    location: z.string().describe("The city and state, e.g. San Francisco, CA"),
  }),
  run: ({ location }: { location: string }) => {
    return `The weather is foggy with a temperature of 20°C in ${location}.`;
  },
});

async function main() {
  const message = await client.beta.messages.toolRunner({
    messages: [
      {
        role: "user",
        content: `What is the weather in SF?`,
      },
    ],
    tools: [getWeatherTool],
    model: "claude-3-5-sonnet-latest",
    max_tokens: 1024,
    // the maximum number of iterations to run the tool
    max_iterations: 10,
  });

  console.log("Final response:", message.content);
}

main();
