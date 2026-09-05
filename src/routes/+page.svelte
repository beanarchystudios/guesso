<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>Guesso</title>
	<meta name="description" content="Guesso — The quietest classroom you'll ever see." />
</svelte:head>

<main class="flex min-h-svh flex-col items-center justify-center px-6">
	<div class="flex max-w-2xl flex-col items-center text-center">
		<h1 class="text-5xl font-bold tracking-tight text-chart-1 sm:text-6xl md:text-7xl">Guesso</h1>

		<p class="mt-4 text-lg text-muted-foreground sm:text-xl">
			The quietest classroom you'll ever see.
		</p>

		<Button
			href="/dashboard"
			size="lg"
			class="mt-6 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0"
		>
			Get started
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" />
				<path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
	</div>
</main>
