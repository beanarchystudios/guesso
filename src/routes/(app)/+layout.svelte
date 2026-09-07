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

	import { Button } from '$lib/components/ui/button';
	let { children, data } = $props();
	const courseId = $derived(page.params.courseId);
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
				<div class="px-2 text-sm">
					<p class="truncate font-medium" title={data.account.name}>{data.account.name}</p>
					<p class="truncate text-xs text-muted-foreground" title={data.account.instanceUrl}>
						{new URL(data.account.instanceUrl).hostname}
					</p>
				</div>
			{/if}
			<form method="POST" action="/logout">
				<Button type="submit" variant="outline" class="w-full">Sign out</Button>
			</form>
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
