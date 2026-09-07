<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/svelte';
	import {
		AssignmentsIcon,
		ArrowDown01Icon,
		Chat01Icon,
		CheckmarkCircle02Icon,
		ExternalLinkIcon,
		FileTextIcon,
		Folder01Icon,
		LockKeyIcon,
		NotebookTabsIcon,
		Quiz01Icon
	} from '@hugeicons/core-free-icons';
	import { listCourseModules, type CourseModuleItem } from '$lib/remote/canvas/modules.remote';

	const courseId = page.params.courseId ?? '';
	const modulesQuery = listCourseModules({ courseId });
	const modules = $derived(modulesQuery.current ?? []);

	const itemIcons: Record<string, IconSvgElement> = {
		Assignment: AssignmentsIcon,
		Discussion: Chat01Icon,
		ExternalUrl: ExternalLinkIcon,
		File: FileTextIcon,
		Page: FileTextIcon,
		Quiz: Quiz01Icon,
		SubHeader: Folder01Icon
	};

	function getItemIcon(item: CourseModuleItem) {
		return itemIcons[item.type] ?? NotebookTabsIcon;
	}
</script>

<svelte:head><title>Modules | Guesso</title></svelte:head>

<main class="h-full overflow-y-auto">
	<div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
		<header class="mb-6">
			<h1 class="text-2xl font-semibold tracking-tight">Modules</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Follow the course content in the order your instructor provided it.
			</p>
		</header>

		{#if modulesQuery.loading && !modulesQuery.ready && modules.length === 0}
			<div class="space-y-3" aria-hidden="true">
				{#each [0, 1, 2, 3] as skeleton (skeleton)}
					<div class="h-16 animate-pulse rounded-xl border bg-muted"></div>
				{/each}
			</div>
			<p class="sr-only" role="status">Loading modules...</p>
		{:else if modulesQuery.error && modules.length === 0}
			<p class="text-sm text-destructive" role="alert">Unable to load modules from Canvas.</p>
		{:else if modules.length === 0}
			<p class="text-sm text-muted-foreground">This course does not have any modules yet.</p>
		{:else}
			{#if modulesQuery.error}
				<p class="mb-4 text-sm text-destructive" role="alert">
					Unable to refresh modules. Showing the last loaded list.
				</p>
			{/if}

			<div class="space-y-3">
				{#each modules as module, index (module.id)}
					{@const completedItems = module.items.filter((item) => item.completed === true).length}
					{@const hasProgress = module.items.some((item) => item.completed !== null)}
					<details open={index === 0} class="group rounded-xl border bg-card text-card-foreground">
						<summary
							class="flex cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-4 transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden"
						>
							<HugeiconsIcon
								icon={ArrowDown01Icon}
								strokeWidth={2}
								class="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
							/>
							<span class="min-w-0 flex-1">
								<span class="block truncate font-semibold">{module.name}</span>
								<span class="mt-1 block text-xs text-muted-foreground">
									{#if module.locked}
										Locked
									{:else if hasProgress}
										{completedItems} of {module.items.length} complete
									{:else}
										{module.itemsCount} {module.itemsCount === 1 ? 'item' : 'items'}
									{/if}
								</span>
							</span>
							{#if module.locked}
								<HugeiconsIcon
									icon={LockKeyIcon}
									strokeWidth={2}
									class="size-4 shrink-0 text-muted-foreground"
									aria-label="Locked"
								/>
							{/if}
						</summary>

						{#if module.locked}
							<p class="border-t px-4 py-4 text-sm text-muted-foreground">
								This module is locked in Canvas.
							</p>
						{:else if module.items.length === 0}
							<p class="border-t px-4 py-4 text-sm text-muted-foreground">This module is empty.</p>
						{:else}
							<ul class="divide-y border-t">
								{#each module.items as item (item.id)}
									<li>
										{#if item.href}
											<a
												href={item.href}
												target="_blank"
												rel="external noopener noreferrer"
												class="flex items-center gap-3 px-4 py-3 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
												style={`--item-indent: ${item.indent}`}
											>
												<HugeiconsIcon
													icon={getItemIcon(item)}
													strokeWidth={2}
													class="size-4 shrink-0 text-muted-foreground"
												/>
												<span class="min-w-0 flex-1 truncate">{item.title}</span>
												<span class="hidden text-xs text-muted-foreground sm:inline"
													>{item.type}</span
												>
												{#if item.completed === true}
													<HugeiconsIcon
														icon={CheckmarkCircle02Icon}
														strokeWidth={2}
														class="size-4 shrink-0 text-chart-2"
														aria-label="Complete"
													/>
												{/if}
											</a>
										{:else}
											<div
												class="flex items-center gap-3 px-4 py-3 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm text-muted-foreground"
												style={`--item-indent: ${item.indent}`}
											>
												<HugeiconsIcon
													icon={getItemIcon(item)}
													strokeWidth={2}
													class="size-4 shrink-0"
												/>
												<span class="min-w-0 flex-1 truncate">{item.title}</span>
												<span class="text-xs">{item.type}</span>
											</div>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</details>
				{/each}
			</div>
		{/if}
	</div>
</main>
