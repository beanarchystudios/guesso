<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Card from '$lib/components/ui/card';
	import { getCustomColors } from '$lib/remote/canvas/account.remote';
	import { listFavoriteCourses } from '$lib/remote/canvas/courses.remote';

	const favoriteCourses = listFavoriteCourses();
	const customColors = getCustomColors();
	const courses = $derived(favoriteCourses.current ?? []);
	const colors = $derived(customColors.current ?? {});
</script>

<svelte:head>
	<title>Dashboard | Guesso</title>
</svelte:head>

<div class="min-h-full">
	<div class="w-full">
		{#if favoriteCourses.loading && !favoriteCourses.ready}
			<p class="text-sm text-muted-foreground" role="status">Loading favorite courses...</p>
		{:else if favoriteCourses.error}
			<p class="text-sm text-destructive" role="alert">Unable to load favorite courses.</p>
		{:else if courses.length === 0}
			<p class="text-sm text-muted-foreground">No favorite courses yet.</p>
		{:else}
			<div class="grid auto-rows-min gap-4 p-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
				{#each courses as course (course.id)}
					<a
						href={resolve(`/courses/${course.id}`)}
						class="block rounded-xl duration-100 hover:ring-1 hover:ring-(--course)"
						style:--course={colors[`course_${course.id}`] ?? 'transparent'}
					>
						<Card.Root
							class="overflow-hidden pt-0 transition-colors hover:border-primary/40 hover:bg-muted/40"
						>
							<Card.Header class="gap-0 px-0">
								{#if course.image_download_url}
									<div class="relative">
										<img
											src={course.image_download_url}
											alt={course.name}
											class="aspect-131/73 w-full object-cover"
										/>
										<div class="absolute inset-0 bg-(--course) opacity-40"></div>
									</div>
								{:else}
									<div
										class="aspect-131/73 w-full bg-linear-to-b from-(--course)/50 to-transparent"
									></div>
								{/if}
							</Card.Header>

							<Card.Content>
								<Card.Title class="line-clamp-1 truncate">{course.name}</Card.Title>
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
