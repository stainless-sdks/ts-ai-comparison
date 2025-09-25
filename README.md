# AI SDK Comparisons

This repository contains example scripts showing a side-by-side comparison of SDK functionality between the `@anthropic-ai/sdk` and the `@mistralai/mistralai`.

## Forward compatibility

This example demonstrates the behavior of undocumented request and response properties in the SDK.

- [anthropic (Stainless)](examples/anthropic-forward-compatibility.ts)
- [mistral](examples/mistral-forward-compatibility.ts)

## Tool use

This example shows how to define and pass tool definitions to a model.

- [anthropic (Stainless)](examples/anthropic-function-running.ts)
- [mistral](examples/mistral-function-running.ts)

# Running the examples

1. Install dependencies with `yarn install`.
2. Set your environment variables with the relevant API keys (eg `ANTHROPIC_API_KEY` or `MISTRAL_API_KEY`).
3. Run an example with `yarn tsx examples/<example-file>.ts`.
