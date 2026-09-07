<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	let pending = $state(false);
</script>

<svelte:head><title>Connect to Canvas · Guesso</title></svelte:head>

<main class="flex min-h-svh items-center justify-center px-6 py-12">
	<div class="w-full max-w-md">
		<a href={resolve('/')} class="text-2xl font-bold tracking-tight text-chart-1">Guesso</a>
		<h1 class="mt-8 text-3xl font-semibold tracking-tight">Connect to Canvas</h1>
		<p class="mt-3 text-muted-foreground">
			Your courses, deadlines, and messages, all in one place. Sign in with your school's Canvas
			address and a personal API token.
		</p>
		{#if data.expired && !form?.message}
			<p role="status" class="mt-6 text-sm text-muted-foreground">
				Your session or Canvas token expired. Connect again to continue.
			</p>
		{/if}
		<form
			method="POST"
			class="mt-8 space-y-5"
			use:enhance={() => {
				pending = true;
				return async ({ result, update }) => {
					pending = false;
					if (result.type === 'redirect') window.location.assign(result.location);
					else await update({ reset: false });
				};
			}}
		>
			<div class="space-y-2">
				<label for="instanceUrl" class="text-sm font-medium">Canvas URL</label>
				<Input
					id="instanceUrl"
					name="instanceUrl"
					type="url"
					placeholder="https://school.instructure.com"
					value={form?.instanceUrl ?? ''}
					required
					maxlength={253}
					autocomplete="url"
					spellcheck={false}
				/>
			</div>
			<div class="space-y-2">
				<label for="token" class="text-sm font-medium">API token</label>
				<Input
					id="token"
					name="token"
					type="password"
					required
					maxlength={1024}
					autocomplete="current-password"
					aria-describedby="token-help"
				/>
				<p id="token-help" class="text-sm text-muted-foreground">
					In Canvas, open Account → Settings → Approved Integrations → New Access Token. Your school
					must allow personal access tokens.
				</p>
			</div>
			{#if form?.message}<p role="alert" class="text-sm text-destructive">{form.message}</p>{/if}
			<Button type="submit" class="w-full" disabled={pending}
				>{pending ? 'Connecting…' : 'Connect to Canvas'}</Button
			>
			<p class="text-center text-sm text-muted-foreground">
				Stay signed in on this browser for 30 days. Sign out when using a shared device.
			</p>
		</form>
	</div>
</main>
