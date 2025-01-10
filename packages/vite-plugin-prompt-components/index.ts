import { Plugin } from 'vite';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { generateText, LanguageModelV1 } from 'ai';

interface PromptXOptions {
	/** Required model from language model provider */
	model: LanguageModelV1;
	/** Optional system prompt to customize component generation */
	systemPrompt?: string;
	/** Optional transform function to modify the prompt text before component creation */
	transformPrompt?: (text: string) => string;
	/** Whether to include TypeScript type annotations. Defaults to true */
	typescript?: boolean;
}

async function generateComponentCode(
	promptText: string,
	filePath: string,
	model: LanguageModelV1,
	systemPrompt?: string
): Promise<string> {
	const componentName = path.basename(filePath, '.promptx')
		.split('-')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

	const defaultSystemPrompt = `You are an expert React developer. Convert the following prompt text into a modern React component.
The component should:
1. Include proper TypeScript types
2. Handle loading and error states
3. Follow React best practices
4. Use modern React patterns
5. Be well-documented with JSDoc comments
6. Export the component as a default export`;

	const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

	const userPrompt = `Create a React component named ${componentName} that uses the following prompt text: 

${promptText}

Only return the code for the component, nothing else. Ensure the code is within a single code block.`;

	try {

		const { text } = await generateText({
			model,
			system: finalSystemPrompt,
			messages: [{ role: 'user', content: userPrompt }],
			maxTokens: 2_000,
		})

		// Extract code within the code block
		const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
		if (codeMatch) {
			return codeMatch[1].trim();
		} else {
			return text
		}
	} catch (error) {
		console.error('Error generating component code:', error);
		throw error;
	}
}

function getChecksum(data: string): string {
	return crypto.createHash('md5').update(data).digest('hex');
}

export default function promptxPlugin(options: PromptXOptions): Plugin {
	if (!options.model) {
		throw new Error('language model is required for vite-plugin-prompt-components');
	}

	const {
		model,
		systemPrompt,
		transformPrompt = (text) => text,
		typescript: _typescript = true
	} = options;

	return {
		name: 'vite-plugin-promptx',
		enforce: 'pre',

		async transform(code: string, id: string) {
			// Only process .promptx files
			if (!id.endsWith('.promptx')) {
				return null;
			}

			try {
				// Read the prompt file
				const promptText = await fs.readFile(id, 'utf-8');

				// Generate a checksum for the prompt text
				const checksum = getChecksum(promptText);
				const cacheDir = path.join(path.dirname(id), '.cache');
				const cacheFilePath = path.join(cacheDir, `${checksum}-${path.basename(id)}.tsx`);

				// Ensure the cache directory exists
				await fs.mkdir(cacheDir, { recursive: true });

				// Check if the transformed component already exists
				try {
					const cachedComponent = await fs.readFile(cacheFilePath, 'utf-8');
					console.log('Using cached component:', id, cacheFilePath);
					return {
						code: cachedComponent,
						map: null
					};
				} catch (error) {
					// Cache file does not exist, proceed to generate the component
				}

				// Transform the prompt text if a transform function is provided
				const transformedPrompt = transformPrompt(promptText);

				// Generate the React component using Anthropic
				const component = await generateComponentCode(
					transformedPrompt,
					id,
					model,
					systemPrompt
				);

				// Add necessary imports at the top of the generated code
				const imports = ``;

				const finalCode = `${imports}\n${component}`;

				// Save the transformed component to the cache file
				await fs.writeFile(cacheFilePath, finalCode, 'utf-8');

				// Remove old checksum files that contain the id
				const files = await fs.readdir(cacheDir);
				for (const file of files) {
					if (file.includes(path.basename(id)) && file !== path.basename(cacheFilePath)) {
						await fs.unlink(path.join(cacheDir, file));
					}
				}

				return {
					code: finalCode,
					map: null
				};
			} catch (error) {
				console.error(`Error processing promptx file ${id}:`, error);
				return null;
			}
		},

		// Add this to help with file resolution
		async resolveId(id: string, importer) {
			if (!id.endsWith('.promptx')) {
				return null;
			}

			// If the id is a relative path, resolve it relative to the importer
			if (id.startsWith('.') && importer) {
				const resolvedPath = path.resolve(path.dirname(importer), id);
				console.log('Resolved promptx path:', resolvedPath);

				// Check if file exists
				try {
					await fs.access(resolvedPath);
					return resolvedPath;
				} catch (error) {
					console.error(`File not found: ${resolvedPath}`);
					throw new Error(`Cannot find promptx file: ${id} (resolved to ${resolvedPath})`);
				}
			}

			return null;
		},
		// Configure the plugin to handle .promptx files
		config(config) {
			return {
				resolve: {
					extensions: ['.promptx', ...(config.resolve?.extensions || [])]
				},
				esbuild: {
					include: /\.promptx$/,
					loader: 'tsx',
				},
				jsx: 'preserve',
			};
		},
		configureServer(server) {
			// Add support for HMR
			server.watcher.add('**/*.promptx');
		},

	};
}

// Add type definition for module augmentation
declare module 'vite' {
	interface Plugin {
		enforce?: 'pre' | 'post';
	}
}