<script>
	import BreadcrumbLogo from "$lib/components/BreadcrumbLogo.svelte";
	import Button from "$lib/components/Button.svelte";
</script>

<div class="flex mx-1 items-center h-12">
	<BreadcrumbLogo path="guessit" />
</div>

<div class="max-w-md mx-auto flex flex-col mt-16 items-stretch">
	<h3 class="text-title-lg text-secondary-dark text-center">Instructions</h3>
	<p class="text-body-lg mt-4">
		The streamer picks a category of people, places, or things. Random chat members are picked to
		ask 1 question each and optionally guess the answer.
	</p>

	<Button variant="filled" href="guessit/play" class="max-w-xs w-full mt-8 mx-auto">Play</Button>
</div>
