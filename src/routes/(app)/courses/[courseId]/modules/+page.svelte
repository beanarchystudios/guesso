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
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
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

	const itemTypeLabels: Record<string, string> = {
		ExternalUrl: 'Link',
		ExternalTool: 'Tool',
		SubHeader: 'Section'
	};
</script>

<svelte:head><title>Modules | Guesso</title></svelte:head>

<main class="h-full overflow-y-auto">
	<div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
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
				class="space-y-3 overflow-visible rounded-none border-none"
			>
				{#each modules as module (module.id)}
					{@const completedItems = module.items.filter((item) => item.completed === true).length}
					{@const hasProgress = module.items.some((item) => item.completed !== null)}
					<Accordion.Item
						value={module.id}
						class="rounded-xl border bg-card text-card-foreground shadow-xs not-last:border-b data-open:bg-card"
					>
						<Accordion.Trigger
							class="items-center gap-3 rounded-xl border-0 px-4 py-4 hover:no-underline focus-visible:ring-3 focus-visible:ring-ring/30"
						>
							<span class="min-w-0 flex-1">
								<span class="flex min-w-0 items-center gap-2">
									<span class="truncate text-sm font-semibold sm:text-base">{module.name}</span>
									{#if module.locked}
										<Badge variant="outline" class="shrink-0 text-muted-foreground">
											<HugeiconsIcon icon={LockKeyIcon} strokeWidth={2} data-icon="inline-start" />
											Locked
										</Badge>
									{/if}
								</span>
								{#if !module.locked}
									<span class="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
										{#if hasProgress}
											<Progress
												value={completedItems}
												max={module.items.length}
												class="h-1.5 w-24 shrink-0"
												aria-label="Module progress"
											/>
											<span>{completedItems} of {module.items.length} complete</span>
										{:else}
											<span>{module.itemsCount} {module.itemsCount === 1 ? 'item' : 'items'}</span>
										{/if}
									</span>
								{/if}
							</span>
						</Accordion.Trigger>

						<Accordion.Content class="pb-0 [&_a]:no-underline">
							{#if module.locked}
								<p class="-mx-4 border-t px-4 py-4 text-sm text-muted-foreground">
									This module is locked in Canvas.
								</p>
							{:else if module.items.length === 0}
								<p class="-mx-4 border-t px-4 py-4 text-sm text-muted-foreground">
									This module is empty.
								</p>
							{:else}
								<ul class="-mx-4 divide-y border-t">
									{#each module.items as item (item.id)}
										<li>
											{#if item.href}
												<a
													href={item.href}
													target="_blank"
													rel="external noopener noreferrer"
													class="group flex items-center gap-3 px-4 py-2.5 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
													style={`--item-indent: ${item.indent}`}
												>
													<span
														class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-background"
													>
														<HugeiconsIcon
															icon={getItemIcon(item)}
															strokeWidth={2}
															class="size-4"
														/>
													</span>
													<span class="min-w-0 flex-1 truncate">{item.title}</span>
													<Badge
														variant="secondary"
														class="hidden text-muted-foreground sm:inline-flex"
													>
														{itemTypeLabels[item.type] ?? item.type}
													</Badge>
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
													class="flex items-center gap-3 px-4 py-2.5 pl-[calc(1rem+var(--item-indent)*1.25rem)] text-sm text-muted-foreground"
													style={`--item-indent: ${item.indent}`}
												>
													{#if item.type === 'SubHeader'}
														<span
															class="min-w-0 flex-1 truncate text-xs font-semibold tracking-wide text-foreground/70 uppercase"
															>{item.title}</span
														>
													{:else}
														<span
															class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted"
														>
															<HugeiconsIcon
																icon={getItemIcon(item)}
																strokeWidth={2}
																class="size-4"
															/>
														</span>
														<span class="min-w-0 flex-1 truncate">{item.title}</span>
														<Badge
															variant="secondary"
															class="hidden text-muted-foreground sm:inline-flex"
														>
															{itemTypeLabels[item.type] ?? item.type}
														</Badge>
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
