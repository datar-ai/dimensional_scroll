<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Uses the OpenRouter API for streaming story generation while remaining provider agnostic
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Providers

This template now uses the [OpenRouter API](https://openrouter.ai/) through the [`@openrouter/ai-sdk-provider`](https://www.npmjs.com/package/@openrouter/ai-sdk-provider). Configure your preferred model with the `OPENROUTER_MODEL` environment variable (defaults to `openrouter/auto`) and authenticate requests with `OPENROUTER_API_KEY`. Each call automatically forwards the `APP_BASE_URL` and `APP_TITLE` headers recommended by OpenRouter.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can still switch to other providers as needed by adjusting the server-side integration.

## Environment Variables

Create a `.env.local` file (or use `vercel env pull`) and supply the following values:

- `OPENROUTER_API_KEY`: Required. Your OpenRouter API key (format `sk-or-...`).
- `OPENROUTER_MODEL`: Optional. Default model identifier to stream from (`openrouter/auto`).
- `APP_BASE_URL`: Optional. Public URL of your deployment, used for OpenRouter attribution headers.
- `APP_TITLE`: Optional. Title shown in OpenRouter's request logs.
- `STORY_SYSTEM_PROMPT`: Optional. Override the shared narrative system prompt used for every chat session.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/nextjs-ai-chatbot)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
npm run dev
```

(`pnpm dev` works as well if you prefer pnpm directly.)

Your app template should now be running on [localhost:3000](http://localhost:3000).
