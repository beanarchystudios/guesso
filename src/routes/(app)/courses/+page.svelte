<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Table from '$lib/components/ui/table';
	import {
		listAllCourses,
		listFavoriteCourses,
		type Course
	} from '$lib/remote/canvas/courses.remote';

	const coursesQuery = listAllCourses();
	const favoritesQuery = listFavoriteCourses();
	const courses = $derived(coursesQuery.current ?? []);
	const favoriteIds = $derived(
		new Set((favoritesQuery.current ?? []).map((course) => String(course.id)))
	);

	function isEnrolled(course: Course) {
		return course.enrollments?.some(
			({ enrollment_state }) => enrollment_state === 'active' || enrollment_state === 'completed'
		);
	}
</script>

<svelte:head>
	<title>Courses | Guesso</title>
</svelte:head>

<main class="p-6">
	{#if (coursesQuery.loading && !coursesQuery.ready) || (favoritesQuery.loading && !favoritesQuery.ready)}
		<p class="mt-6 text-sm text-muted-foreground" role="status">Loading courses...</p>
	{:else if coursesQuery.error || favoritesQuery.error}
		<p class="mt-6 text-sm text-destructive" role="alert">Unable to load courses.</p>
	{:else if courses.length === 0}
		<p class="mt-6 text-sm text-muted-foreground">No courses found.</p>
	{:else}
		<div class="mt-6 rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head scope="col">Favorite</Table.Head>
						<Table.Head scope="col">Name</Table.Head>
						<Table.Head scope="col">Enrolled</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each courses as course (course.id)}
						<Table.Row>
							<Table.Cell>{favoriteIds.has(String(course.id)) ? 'Yes' : 'No'}</Table.Cell>
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
