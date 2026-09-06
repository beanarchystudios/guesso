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

	let { children } = $props();
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
		</Sidebar.Content>
	</Sidebar.Root>

	<Sidebar.Inset class="max-h-[calc(100vh-1rem)] overflow-hidden">
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
