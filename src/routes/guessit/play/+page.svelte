<script>
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import * as tmi from 'tmi.js';

	const keyword = '!join';
	const players = new Set();

	let client;

	let isStarted = false;
	let isTryingToStart = false;
	let startError = '';
	let streamerUsername = 'jabroni_mike';

	let showSettings = false;

	let questionsAndAnswers = [];

	async function startGame() {
		try {
			isTryingToStart = true;

			const chat = await tryConnectingToChat(streamerUsername);

			chat.on('message', (channel, tags, message, self) => {
				if (self) return;
				if (message.toLowerCase() === keyword) {
					players.add(tags.username);
				}
			});

			questionsAndAnswers = new Array(10).fill(1).map(() => ({
				chatter: 'thegreatj',
				question: '',
				answer: '',
				guess: '',
				correct: false
			}));

			isStarted = true;
		} catch (error) {
			console.error(error);
			startError = error.message;
		} finally {
			isTryingToStart = false;
		}
	}

	async function tryConnectingToChat(username) {
		return new Promise((resolve, reject) => {
			client = new tmi.Client({
				options: { debug: false },
				identity: {
					username: 'justinfan1337',
					password: ''
				},
				channels: [username]
			});
			client.connect().catch((error) => {
				reject('Failed to connect to chat for user ' + username);
				console.error(error);
			});
			client.on('connected', () => {
				resolve(client);
			});
		});
	}

	onMount(() => {
		if (!browser) return;

		tryConnectingToChat();
	});

	onDestroy(() => {
		try {
			client?.disconnect();
		} catch (e) {
			console.error(e);
		}
	});
</script>

<code>chatplays.games/guessit</code>

<h1>GuessIt</h1>

{#if !isStarted}
	<h3>Game Settings</h3>

	<div>
		<label for="streamerUsername">Streamer Username</label>
		<input type="text" id="streamerUsername" bind:value={streamerUsername} />
	</div>

	{#if isTryingToStart}
		<p>Trying to start game...</p>
	{:else}
		<button on:click={startGame}>Start Game</button>
	{/if}

	{#if startError}
		<p style="color: red;">{startError}</p>
	{/if}
{/if}

{#if isStarted}
	<button>⚙️</button>

	<p>Guess what Obscure Video Game Character jabroni_mike is thinking of.</p>

	<p>type !join in chat to enter</p>

	{#each questionsAndAnswers as qna}
		<div>{qna.chatter}</div>
	{/each}
{/if}
