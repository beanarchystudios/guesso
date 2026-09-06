<script lang="ts">
	import { resolve } from '$app/paths';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { StarIcon, StarOffIcon } from '@hugeicons/core-free-icons';
	import * as Table from '$lib/components/ui/table';
	import { getCustomColors } from '$lib/remote/canvas/account.remote';
	import {
		listAllCourses,
		listFavoriteCourses,
		type Course
	} from '$lib/remote/canvas/courses.remote';

	const coursesQuery = listAllCourses();
	const favoritesQuery = listFavoriteCourses();
	const customColorsQuery = getCustomColors();
	const courses = $derived(coursesQuery.current ?? []);
	const favoriteIds = $derived(
		new Set((favoritesQuery.current ?? []).map((course) => String(course.id)))
	);
	const colors = $derived(customColorsQuery.current ?? {});
	const sortedCourses = $derived(
		[...courses].sort((first, second) => courseOrder(first) - courseOrder(second))
	);

	function isEnrolled(course: Course) {
		return course.enrollments?.some(
			({ enrollment_state }) => enrollment_state === 'active' || enrollment_state === 'completed'
		);
	}

	function courseOrder(course: Course) {
		if (favoriteIds.has(String(course.id))) return 0;
		return isEnrolled(course) ? 1 : 2;
	}
</script>

<svelte:head>
	<title>Courses | Guesso</title>
</svelte:head>

<main class="overflow-y-auto p-6">
	{#if (coursesQuery.loading && !coursesQuery.ready) || (favoritesQuery.loading && !favoritesQuery.ready) || (customColorsQuery.loading && !customColorsQuery.ready)}
		<p class="mt-6 text-sm text-muted-foreground" role="status">Loading courses...</p>
	{:else if coursesQuery.error || favoritesQuery.error}
		<p class="mt-6 text-sm text-destructive" role="alert">Unable to load courses.</p>
	{:else if courses.length === 0}
		<p class="mt-6 text-sm text-muted-foreground">No courses found.</p>
	{:else}
		<div>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="text-muted-foreground" scope="col">Favorite</Table.Head>
						<Table.Head class="text-muted-foreground" scope="col">Name</Table.Head>
						<Table.Head class="text-muted-foreground" scope="col">Enrolled</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sortedCourses as course (course.id)}
						<Table.Row style={`--course: ${colors[`course_${course.id}`] ?? 'var(--primary)'}`}>
							<Table.Cell>
								{#if favoriteIds.has(String(course.id))}
									<HugeiconsIcon
										icon={StarIcon}
										class="fill-(--course)"
										size={20}
										strokeWidth={2}
										color="var(--course)"
										fill="var(--course)"
										aria-label="Favorite"
									/>
								{:else}
									<HugeiconsIcon
										icon={StarOffIcon}
										class="[&>path:last-child]:stroke-(--muted-foreground)"
										size={20}
										strokeWidth={2}
										color="var(--course)"
										fill="none"
										aria-label="Not a favorite"
									/>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<a
									href={resolve(`/courses/${course.id}`)}
									class="font-medium underline-offset-4 hover:underline"
								>
									{course.name}
								</a>
							</Table.Cell>
							<Table.Cell>{isEnrolled(course) ? 'Yes' : 'No'}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</main>
