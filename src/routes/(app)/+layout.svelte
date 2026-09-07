<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		BookOpen01Icon,
		Calendar03Icon,
		Home01Icon,
		Mail01Icon,
		PaintBoardIcon
	} from '@hugeicons/core-free-icons';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import CourseSidebar from '$lib/components/course-sidebar.svelte';

	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	let { children, data } = $props();
	const courseId = $derived(page.params.courseId);
	const initials = $derived(
		data.account?.name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => Array.from(part)[0])
			.join('')
			.toUpperCase() || '?'
	);
	let signOutForm = $state<HTMLFormElement>();
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton class="text-chart-1!">
						{#snippet child({ props })}
							<a href={resolve('/')} {...props}>
								<HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} />
								<span class="truncate">Guesso</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === '/dashboard'}>
								{#snippet child({ props })}
									<a href={resolve('/dashboard')} {...props}>
										<HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
										<span>Dashboard</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname.startsWith('/courses')}>
								{#snippet child({ props })}
									<a href={resolve('/courses')} {...props}>
										<HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />
										<span>Courses</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === '/calendar'}>
								{#snippet child({ props })}
									<a href={resolve('/calendar')} {...props}>
										<HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
										<span>Calendar</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === '/inbox'}>
								{#snippet child({ props })}
									<a href={resolve('/inbox')} {...props}>
										<HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
										<span>Inbox</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>

			{#if courseId}
				{#key courseId}
					<CourseSidebar {courseId} />
				{/key}
			{/if}
		</Sidebar.Content>
		<Sidebar.Footer>
			{#if data.account}
				{@const account = data.account}
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton
										{...props}
										size="lg"
										aria-label={`Account menu for ${account.name}`}
									>
										<Avatar.Root><Avatar.Fallback>{initials}</Avatar.Fallback></Avatar.Root>
										<div class="grid min-w-0 flex-1 text-left text-sm">
											<span class="truncate font-medium">{account.name}</span>
											<span class="truncate text-xs text-muted-foreground"
												>{new URL(account.instanceUrl).hostname}</span
											>
										</div>
									</Sidebar.MenuButton>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content side="top" align="start" class="min-w-48">
								<DropdownMenu.Item onSelect={() => signOutForm?.requestSubmit()}
									>Sign out</DropdownMenu.Item
								>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
				<form bind:this={signOutForm} method="POST" action="/logout" hidden></form>
			{/if}
		</Sidebar.Footer>
	</Sidebar.Root>

	<Sidebar.Inset class="max-h-[calc(100vh-1rem)] overflow-hidden">
		<div class="flex items-center gap-2 border-b p-2 md:hidden">
			<Sidebar.Trigger />
			<span class="text-sm font-medium">Guesso</span>
		</div>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
