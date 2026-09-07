<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Link01Icon } from '@hugeicons/core-free-icons';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getCourse, listCourseTabs, type CourseTab } from '$lib/remote/canvas/courses.remote';

	let { courseId } = $props<{ courseId: string }>();

	const courseQuery = getCourse({ courseId });
	const courseTabsQuery = listCourseTabs({ courseId });
	const course = $derived(courseQuery.current);
	const tabs = $derived(courseTabsQuery.current ?? []);

	function isActive(tab: CourseTab) {
		const coursePath = `/courses/${courseId}`;
		return tab.id === 'home'
			? page.url.pathname === coursePath
			: page.url.pathname.startsWith(`${coursePath}/${tab.id}`);
	}
</script>

{#if course}
	<Sidebar.Group>
		<Sidebar.GroupLabel class="min-w-0 truncate" title={course.name}
			>{course.name}</Sidebar.GroupLabel
		>
		<Sidebar.GroupContent>
			{#if tabs.length > 0}
				<Sidebar.Menu>
					{#each tabs as tab (tab.id)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(tab)} tooltipContent={tab.label}>
								{#snippet child({ props })}
									<a
										href={tab.htmlUrl}
										target="_blank"
										rel="external noopener noreferrer"
										{...props}
									>
										<HugeiconsIcon icon={Link01Icon} strokeWidth={2} />
										<span>{tab.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			{:else if courseTabsQuery.error}
				<p class="px-3 text-xs text-destructive" role="alert">Unable to load course tabs.</p>
			{:else if courseTabsQuery.loading || !courseTabsQuery.ready}
				<p class="px-3 text-xs text-muted-foreground" role="status">Loading tabs...</p>
			{/if}
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/if}
