<p align="center">
	<img width="640" src="https://github.com/jhsu/vite-plugin-prompt-components/blob/main/usage.png?raw=true" alt="Vite Plugin Prompt Component usage">
</p>
<br/>

# Vite Plugin Prompt Components

Write components using natural language prompts

## Overview

`vite-plugin-prompt-components` is a Vite plugin that allows you to write React components using natural language prompts. This plugin leverages AI models to generate React components based on the provided prompt text in a `.promptx` file

## Features

- write React components using natural language prompts and import and use them in your React app
- generated components are cached to save api calls

## Installation

```bash
npm install vite-plugin-prompt-components
```

or

```bash
pnpm add vite-plugin-prompt-components
```

## Usage

Create a `.promptx` file in your project and write your component using natural language prompts. For example, create a file named `Button.promptx` with the following content:

```plaintext
A button that increments a counter when clicked.
```

```typescript
import Button from './Button.promptx'

export default function App() {
  return (
    <div>
      <Button />
    </div>
  )
}
```

When you run your Vite project, the plugin will generate a React component based on the prompt text in the `.promptx` file. The generated component will be imported and used in your React code.

## Configuration

Add the plugin to your vite config:

```javascript
import { anthropic } from '@ai-sdk/anthropic';
import promptComponents from 'vite-plugin-prompt-components';

const model = anthropic('claude-3-haiku-20240307')

export default defineConfig({
  plugins: [
    promptComponents({
      model,
    }),
    react({
      parserConfig(id) {
        // For now this is needed
        if (id.endsWith('.promptx') || id.endsWith('.tsx')) {
          return {
            syntax: 'typescript',
            tsx: true,
          }
        }
      }
  })],
});
```

## TODO

- [x] working component generation
- [x] cached generated components
- [ ] fix typescript issues when importing `.promptx` components
- [ ] fix vite config to not require parserConfig in `react()` plugin
