import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	ssr: {
		// Keep the CommonJS sanitizer and parser inside Vercel's function bundle.
		noExternal: ['sanitize-html', 'htmlparser2']
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				experimental: {
					async: true
				},
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			experimental: {
				remoteFunctions: true
			},

			adapter: adapter({
				runtime: 'nodejs24.x'
			})
		})
	]
});
