<script lang="ts">
	import { page } from '$app/state';
	import { getFrontPage } from '$lib/remote/canvas/pages.remote';

	const courseId = page.params.courseId ?? '';
	const frontPageQuery = getFrontPage({ courseId });
	const frontPage = $derived(frontPageQuery.current);
</script>

<svelte:head>
	<title>{frontPage?.title ?? 'Course'} | Guesso</title>
</svelte:head>

<main class="h-full overflow-y-auto">
	{#if frontPageQuery.loading && !frontPageQuery.ready}
		<p class="p-6 text-sm text-muted-foreground" role="status">Loading course...</p>
	{:else if frontPageQuery.error}
		<p class="p-6 text-sm text-destructive" role="alert">Unable to load the course front page.</p>
	{:else if frontPage}
		<article class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
			{#if frontPage.body}
				<div
					class="[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-6 [&_img]:max-w-full [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_strong]:font-semibold [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:bg-muted [&_th]:p-2 [&_ul]:mb-4 [&_ul]:space-y-1"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized in getFrontPage -->
					{@html frontPage.body}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">This course does not have a front page yet.</p>
			{/if}
		</article>
	{:else}
		<p class="p-6 text-sm text-muted-foreground">Course information is unavailable.</p>
	{/if}
</main>
