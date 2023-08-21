<div class="flex flex-col items-center h-full">
	<h1
		class="logo text-6xl mt-8 font-extrabold text-transparent bg-gradient-to-t from-primary-dark to-tertiary-dark py-4"
	>
		chatplays.games
	</h1>
	<p class="opacity-80">Created by TheGreatJ</p>

	<h3 class="text-title-md mt-12 mb-4 opacity-80">Games</h3>
	<a
		class="bg-secondaryContainer-dark text-onSecondaryContainer-dark px-6 py-4 rounded-3xl hover:rounded-2xl transition-all"
		href="/guessit"
	>
		<h class="text-title-lg">GuessIt</h>
		<p class="text-body-md opacity-80">Guess what the streamer is thinking of.</p>
	</a>

	<p class="mt-16 text-secondary-dark">
		Have a game idea? <a
			href="https://github.com/jacobcoughenour/chatplays/issues/new"
			class="text-primary-dark">Submit it here</a
		>
	</p>
</div>

<style>
	@keyframes gradient {
		0% {
			background-position: 10% 0%;
		}
		50% {
			background-position: 91% 100%;
		}
		100% {
			background-position: 10% 0%;
		}
	}

	.logo {
		@apply bg-clip-text;

		background-size: 200% 200%;
		animation: gradient 5s linear infinite;
	}
</style>
