<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { getCurrentUser } from '$lib/remote/canvas/account.remote';

	const userQuery = getCurrentUser();
	const user = $derived(userQuery.current);

	function initials(name: string) {
		return (
			name
				.trim()
				.split(/\s+/)
				.slice(0, 2)
				.map((part) => Array.from(part)[0])
				.join('')
				.toUpperCase() || '?'
		);
	}

	const userInitials = $derived(initials(user?.name ?? ''));
	const email = $derived(user?.primary_email ?? user?.email ?? null);
</script>

<svelte:head>
	<title>Profile | Guesso</title>
</svelte:head>

<main class="min-h-full overflow-y-auto p-6">
	<div class="mx-auto max-w-2xl">
		{#if userQuery.loading && !userQuery.ready}
			<p class="text-sm text-muted-foreground" role="status">Loading profile...</p>
		{:else if userQuery.error}
			<p class="text-sm text-destructive" role="alert">Unable to load your profile.</p>
		{:else if user}
			<div class="space-y-8">
				<div class="flex items-center gap-4">
					<Avatar.Root size="lg">
						{#if user.avatar_url}
							<Avatar.Image src={user.avatar_url} alt="" />
						{/if}
						<Avatar.Fallback>{userInitials}</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<h1 class="truncate text-2xl font-semibold tracking-tight">{user.name}</h1>
						{#if user.short_name && user.short_name !== user.name}
							<p class="mt-1 truncate text-sm text-muted-foreground">{user.short_name}</p>
						{/if}
					</div>
				</div>

				<dl class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
					<div>
						<dt class="text-sm text-muted-foreground">Full name</dt>
						<dd class="mt-1 break-words">{user.name}</dd>
					</div>

					{#if email}
						<div>
							<dt class="text-sm text-muted-foreground">Email</dt>
							<dd class="mt-1 break-words">{email}</dd>
						</div>
					{/if}

					{#if user.login_id}
						<div>
							<dt class="text-sm text-muted-foreground">Login ID</dt>
							<dd class="mt-1 break-words">{user.login_id}</dd>
						</div>
					{/if}

					{#if user.time_zone}
						<div>
							<dt class="text-sm text-muted-foreground">Time zone</dt>
							<dd class="mt-1 break-words">{user.time_zone}</dd>
						</div>
					{/if}

					{#if user.locale}
						<div>
							<dt class="text-sm text-muted-foreground">Language</dt>
							<dd class="mt-1 break-words">{user.locale}</dd>
						</div>
					{/if}

					{#if user.bio}
						<div class="sm:col-span-2">
							<dt class="text-sm text-muted-foreground">Bio</dt>
							<dd class="mt-1 break-words whitespace-pre-wrap">{user.bio}</dd>
						</div>
					{/if}
				</dl>

				{#if user.html_url}
					<a
						href={user.html_url}
						target="_blank"
						rel="external noopener noreferrer"
						class="text-sm font-medium text-primary underline-offset-4 hover:underline"
					>
						View profile in Canvas
					</a>
				{/if}
			</div>
		{/if}
	</div>
</main>
