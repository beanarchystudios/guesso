<script lang="ts">
	import { page } from '$app/state';
	import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/svelte';
	import {
		AssignmentsIcon,
		Chat01Icon,
		CheckmarkCircle02Icon,
		ExternalLinkIcon,
		FileTextIcon,
		Folder01Icon,
		LockKeyIcon,
		NotebookTabsIcon,
		Quiz01Icon
	} from '@hugeicons/core-free-icons';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { listCourseModules, type CourseModuleItem } from '$lib/remote/canvas/modules.remote';

	const courseId = page.params.courseId ?? '';
	const modulesQuery = listCourseModules({ courseId });
	const modules = $derived(modulesQuery.current ?? []);

	let userOpenModules = $state<string[] | null>(null);
	const openModules = $derived(userOpenModules ?? (modules.length > 0 ? [modules[0].id] : []));

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
	<div class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		{#if modulesQuery.loading && !modulesQuery.ready && modules.length === 0}
			<div class="space-y-3" aria-hidden="true">
				{#each [0, 1, 2, 3] as skeleton (skeleton)}
					<Skeleton class="h-[4.5rem] rounded-xl" />
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

			<Accordion.Root
				type="multiple"
				value={openModules}
				onValueChange={(value) => (userOpenModules = value)}
				class="overflow-visible rounded-none border-0 bg-transparent"
			>
				{#each modules as module (module.id)}
					<Accordion.Item
						value={module.id}
						class="border-b border-border/70 bg-transparent text-card-foreground first:border-t data-open:bg-transparent!"
					>
						<Accordion.Trigger
							class="items-center gap-4 rounded-none border-0 px-0 py-5 text-left hover:text-chart-1 hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/30"
						>
							<HugeiconsIcon
								icon={NotebookTabsIcon}
								strokeWidth={2}
								class="size-5 shrink-0 text-chart-1 transition-colors"
							/>
							<span class="min-w-0 flex-1 truncate text-base font-semibold sm:text-lg">
								{module.name}
							</span>
							{#if module.locked}
								<span
									class="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground"
								>
									<HugeiconsIcon icon={LockKeyIcon} strokeWidth={2} class="size-4" />
									<span>Locked</span>
								</span>
							{/if}
						</Accordion.Trigger>

						<Accordion.Content class="pb-0 [&_a]:no-underline">
							{#if module.locked}
								<p class="-mx-4 border-t border-border/70 px-4 py-4 text-sm text-muted-foreground">
									This module is locked in Canvas.
								</p>
							{:else if module.items.length === 0}
								<p class="-mx-4 border-t border-border/70 px-4 py-4 text-sm text-muted-foreground">
									This module is empty.
								</p>
							{:else}
								<ul class="-mx-4 divide-y border-t border-border/70">
									{#each module.items as item (item.id)}
										<li>
											{#if item.href}
												<a
													href={item.href}
													target="_blank"
													rel="external noopener noreferrer"
													class="group/item flex items-center gap-3 px-4 py-3 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm text-foreground/85 transition-colors outline-none hover:text-chart-1 focus-visible:text-chart-1 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
													style={`--item-indent: ${item.indent}`}
												>
													<HugeiconsIcon
														icon={getItemIcon(item)}
														strokeWidth={2}
														class="size-[1.125rem] shrink-0 text-muted-foreground transition-colors group-hover/item:text-chart-1"
													/>
													<span class="min-w-0 flex-1 truncate">{item.title}</span>
													{#if item.completed === true}
														<HugeiconsIcon
															icon={CheckmarkCircle02Icon}
															strokeWidth={2}
															class="size-4 shrink-0 text-green-600 dark:text-green-500"
															aria-label="Complete"
														/>
													{/if}
												</a>
											{:else}
												<div
													class="flex items-center gap-3 px-4 py-3 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm text-muted-foreground"
													style={`--item-indent: ${item.indent}`}
												>
													{#if item.type === 'SubHeader'}
														<span
															class="min-w-0 flex-1 truncate text-xs font-semibold tracking-wide text-foreground/70 uppercase"
															>{item.title}</span
														>
													{:else}
														<HugeiconsIcon
															icon={getItemIcon(item)}
															strokeWidth={2}
															class="size-[1.125rem] shrink-0"
														/>
														<span class="min-w-0 flex-1 truncate">{item.title}</span>
													{/if}
												</div>
											{/if}
										</li>
									{/each}
								</ul>
							{/if}
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		{/if}
	</div>
</main>
