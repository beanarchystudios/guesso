<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		BookOpen01Icon,
		Calendar03Icon,
		Home01Icon,
		Mail01Icon
	} from '@hugeicons/core-free-icons';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href={resolve('/dashboard')} {...props}>
								<span
									class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
								>
									G
								</span>
								<span class="truncate text-base font-semibold">Guesso</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
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
		</Sidebar.Content>
	</Sidebar.Root>

	<Sidebar.Inset>
		<header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger />
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
