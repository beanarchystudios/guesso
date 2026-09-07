<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/svelte';
	import {
		AssignmentsIcon,
		CalendarCheckIcon,
		Chat01Icon,
		ClipboardCheckIcon,
		ExternalLinkIcon,
		FileTextIcon,
		Folder01Icon,
		Home01Icon,
		NotebookIcon,
		NotebookTextIcon,
		NotebookTabsIcon,
		Notification03Icon,
		Quiz01Icon,
		SchoolReportCardIcon,
		Settings01Icon,
		Target02Icon,
		UserGroupIcon,
		UserMultipleIcon,
		Video01Icon
	} from '@hugeicons/core-free-icons';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getCourse, listCourseTabs, type CourseTab } from '$lib/remote/canvas/courses.remote';

	let { courseId } = $props<{ courseId: string }>();

	const courseQuery = $derived.by(() => getCourse({ courseId }));
	const courseTabsQuery = $derived.by(() => listCourseTabs({ courseId }));
	const course = $derived(courseQuery.current);
	const tabs = $derived(courseTabsQuery.current ?? []);
	const resolvePath = resolve as unknown as (path: string) => string;

	const courseTabIcons: Record<string, IconSvgElement> = {
		home: Home01Icon,
		modules: NotebookTabsIcon,
		assignments: AssignmentsIcon,
		quizzes: Quiz01Icon,
		grades: SchoolReportCardIcon,
		people: UserMultipleIcon,
		discussions: Chat01Icon,
		announcements: Notification03Icon,
		conferences: Video01Icon,
		collaborations: UserGroupIcon,
		files: Folder01Icon,
		pages: FileTextIcon,
		syllabus: NotebookTextIcon,
		outcomes: Target02Icon,
		rubrics: ClipboardCheckIcon,
		attendance: CalendarCheckIcon,
		settings: Settings01Icon,
		external_tool: ExternalLinkIcon,
		external_tools: ExternalLinkIcon,
		notebook: NotebookIcon
	};

	function getCourseTabIcon(tab: CourseTab) {
		if (tab.id.startsWith('context_external_tool_')) return ExternalLinkIcon;
		return courseTabIcons[tab.id] ?? FileTextIcon;
	}

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
									{#if tab.id === 'modules'}
										<!-- eslint-disable svelte/no-navigation-without-resolve -- runtime route is passed through resolvePath. -->
										<a href={resolvePath(`/courses/${courseId}/modules`)} {...props}>
											<HugeiconsIcon icon={getCourseTabIcon(tab)} strokeWidth={2} />
											<span>{tab.label}</span>
										</a>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
									{:else}
										<!-- eslint-disable svelte/no-navigation-without-resolve -- Canvas URL is validated server-side. -->
										<a
											href={tab.htmlUrl}
											target="_blank"
											rel="external noopener noreferrer"
											{...props}
										>
											<HugeiconsIcon icon={getCourseTabIcon(tab)} strokeWidth={2} />
											<span>{tab.label}</span>
										</a>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
									{/if}
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
