<script>
	import { browser, dev } from "$app/environment";
	import { onDestroy, onMount } from "svelte";
	import * as tmi from "tmi.js";
	import * as _ from "lodash";
	import Button from "$lib/components/Button.svelte";
	import clsx from "clsx";
	import BreadcrumbLogo from "$lib/components/BreadcrumbLogo.svelte";

	// game state

	/** @type {tmi.Client} */
	let client;

	// game settings
	let questionCommand = "";
	let newQuestionCommand = "!q";
	let category = "Obscure Video Game Character";
	let newCategory = "Obscure Video Game Character";
	let rules = "";
	let newRules = "";
	let streamerUsername = dev ? "thegreatj" : "";
	let numOfQuestions = 10;
	let remainingTries = 0;

	let showSettings = false;
	let isStarted = false;
	let isTryingToStart = false;
	let startError = "";

	let canStartGame = false;
	let categoryMessage = "";
	let newCategoryMessage = "";

	/**
	 * @typedef {"not_started" | "waiting_for_questions" | "answering" | "waiting_for_guess" | "guess_picked" | "chat_won" | "chat_lost"} State
	 */
	/** @type {State} */
	let state = "not_started";

	$: {
		canStartGame =
			!!streamerUsername &&
			streamerUsername.length > 0 &&
			!!newQuestionCommand &&
			newQuestionCommand.length > 0;

		categoryMessage = `Guess the ${category} ${streamerUsername} is thinking of.`;
		newCategoryMessage = `Guess the ${newCategory} ${streamerUsername} is thinking of.`;

		isStarted = state !== "not_started";

		canSubmitAnswer = pendingAnswer.trim().length > 0;

		remainingTries = numOfQuestions - questionsAndAnswers.length;
	}

	/**
	 * @typedef {Object} QnAEntry
	 * @property {string} chatter
	 * @property {string?} chatterDisplayName
	 * @property {string} chatterColor
	 * @property {string} question
	 * @property {string} answer
	 * @property {string|null} guess
	 * @property {boolean} isCorrect
	 */
	/** @type {QnAEntry[]} */
	let questionsAndAnswers = [];

	/**
	 * @typedef {Object} Question
	 * @property {string} username
	 * @property {string?} displayName
	 * @property {string?} color
	 * @property {string} question
	 */
	/** @type {Question[]} */
	let submittedQuestions = [];

	/** @type {null|Question} */
	let chosenQuestion = null;
	let pendingAnswer = "";
	let canSubmitAnswer = false;
	/** @type {string[]} */
	let guessMessages = [];
	/** @type {null|string} */
	let chosenGuess = null;

	function pickQuestion() {
		if (!isStarted) return;
		if (submittedQuestions.length === 0) return;

		if (submittedQuestions.length === 1) {
			// pick the only question
			chosenQuestion = submittedQuestions[0];
		} else if (submittedQuestions.length === 2) {
			// pick the other question
			chosenQuestion = submittedQuestions.find((q) => q !== chosenQuestion) ?? chosenQuestion;
		} else {
			// pick a random question
			const chatters = _.groupBy(submittedQuestions, "username");

			// pick a random chatter
			const chattersArray = Object.keys(chatters);

			let randomQuestion = null;
			do {
				const randomChatter = chattersArray[Math.floor(Math.random() * chattersArray.length)];
				// pick a random question from that chatter
				const questions = chatters[randomChatter];
				randomQuestion = questions[Math.floor(Math.random() * questions.length)];
			} while (randomQuestion === chosenQuestion);

			chosenQuestion = randomQuestion;
		}

		pendingAnswer = "";
		state = "answering";
	}

	function submitAnswer() {
		console.log("submitAnswer", canSubmitAnswer);
		if (state !== "answering" || !canSubmitAnswer) return;

		guessMessages = [];
		state = "waiting_for_guess";
	}

	/**
	 * @param {string|null} guess
	 */
	function pickGuess(guess) {
		if (state !== "waiting_for_guess") return;
		chosenGuess = guess;

		state = "guess_picked";
		if (guess === null) {
			guessIs(false);
		}
	}

	function pickAnotherGuess() {
		if (state !== "guess_picked") return;

		state = "waiting_for_guess";
		chosenGuess = null;
	}

	/**
	 * @param {boolean} correct
	 */
	function guessIs(correct) {
		if (chosenQuestion === null) return;

		// add to q and a list
		questionsAndAnswers = questionsAndAnswers.concat([
			{
				chatter: chosenQuestion.username,
				chatterDisplayName: chosenQuestion.displayName,
				chatterColor: "#008FCC",
				question: chosenQuestion.question,
				answer: chosenQuestion.question,
				guess: chosenGuess,
				isCorrect: correct
			}
		]);

		if (correct) {
			state = "chat_won";
			return;
		}

		if (questionsAndAnswers.length >= numOfQuestions) {
			state = "chat_lost";
			return;
		}

		submittedQuestions = [];
		chosenQuestion = null;
		chosenGuess = null;
		pendingAnswer = "";
		state = "waiting_for_questions";
	}

	async function startGame() {
		if (!canStartGame) return;

		applySettings();

		try {
			isTryingToStart = true;

			const chat = await tryConnectingToChat(streamerUsername);

			/** @type {tmi.Events['message']} */
			const messageHandler = (_channel, tags, message, self) => {
				if (self) return;
				if (
					(state === "waiting_for_questions" || state === "answering") &&
					tags.username &&
					message.toLowerCase().startsWith(questionCommand.toLowerCase() + " ")
				) {
					const question = message.substring(questionCommand.length + 1).trim();
					console.log(tags);
					if (question.length > 0)
						submittedQuestions = submittedQuestions.concat([
							{
								username: tags.username,
								displayName: tags["display-name"] ?? null,
								color: tags.color && tags.color.length === 7 ? tags.color : null,
								question
							}
						]);
				}
				if (
					state === "waiting_for_guess" &&
					chosenQuestion &&
					tags.username === chosenQuestion.username
				) {
					message = message.trim();
					if (message.length > 0) {
						guessMessages = guessMessages.concat([message]);
					}
				}
			};
			chat.on("message", messageHandler);

			questionsAndAnswers = [];
			submittedQuestions = [];

			state = "waiting_for_questions";
		} catch (error) {
			console.error(error);
			startError = `${error}`;
		} finally {
			isTryingToStart = false;
		}
	}

	function applySettings() {
		if (!canStartGame) return;
		questionCommand = newQuestionCommand;
		category = newCategory;
		rules = newRules;
		showSettings = false;
	}

	/**
	 * @param {string} username
	 */
	async function tryConnectingToChat(username) {
		return new Promise((resolve, reject) => {
			console.log("Trying to connect to chat for user " + username);

			client = new tmi.Client({
				options: { debug: !!dev },
				identity: {
					// login anonymously with justinfanXXXX account.
					username: "justinfan1337",
					password: ""
				},
				channels: [username]
			});
			client.connect().catch((error) => {
				reject("Failed to connect to chat for user " + username);
				console.error(error);
			});
			client.on("connected", () => {
				console.log("Connected to chat for user " + username);
				resolve(client);
			});
		});
	}

	function reset() {
		questionsAndAnswers = [];
		submittedQuestions = [];
		chosenQuestion = null;
		pendingAnswer = "";
		chosenGuess = null;
		guessMessages = [];
		state = "not_started";
		client?.disconnect();
	}

	onMount(() => {
		if (!browser) return;

		// newQuestionCommand = "!q";
		// newRules = "test rules";
		// startGame();

		// setTimeout(() => {
		// 	questionsAndAnswers = new Array(9).fill(1).map(() => ({
		// 		chatter: "test chatter",
		// 		chatterDisplayName: "test chatter",
		// 		question: "test question",
		// 		answer: "test answer",
		// 		guess: "test guess",
		// 		isCorrect: false
		// 	}));

		// 	submittedQuestions = submittedQuestions.concat([
		// 		{
		// 			displayName: "TheGreatJ",
		// 			username: "thegreatj",
		// 			color: "#008FCC",
		// 			question:
		// 				"jslkdjf ksldj flsdk jfsldj flskdjf lskjdf lksdfsldfjlsdkfjslkdfjlskfj sdlkfj sdlkfj sdlfkjs dfkljsdldkfj slkdfj sd fls djkflsjdflskdfjlsdjflskdjfslfkjsldfkjsdlkfjsdlfkjsdflskdfjl"
		// 		}
		// 	]);

		// 	pickQuestion();

		// 	setTimeout(() => {
		// 		pendingAnswer = "test answer";

		// 		setTimeout(() => {
		// 			submitAnswer();
		// 		}, 500);
		// 	}, 500);
		// }, 500);
	});

	onDestroy(() => {
		try {
			client?.disconnect();
		} catch (e) {
			console.error(e);
		}
	});
</script>

<div class="flex flex-col flex-1 absolute w-full h-full left-0 top-0">
	<div class="flex mx-1 items-center h-12">
		<BreadcrumbLogo path="guessit" />
		{#if isStarted && !showSettings}
			<Button
				symbol="settings"
				on:click={() => {
					showSettings = true;
				}}>Settings</Button
			>
		{/if}
	</div>

	{#if !isStarted || showSettings}
		<form
			on:submit={(e) => {
				e.preventDefault();
				startGame();
			}}
			class="flex flex-col gap-1 w-full max-w-md mx-auto"
		>
			<h3 class="text-title-lg mt-8 text-secondary-dark">Game Settings</h3>

			<div class="flex items-center gap-1">
				<label for="streamerUsername">Streamer username</label>
				<input
					type="text"
					id="streamerUsername"
					class="flex-1"
					bind:value={streamerUsername}
					disabled={isTryingToStart || isStarted}
				/>
			</div>

			<div class="flex items-center gap-1">
				<label for="category">Category</label>
				<input
					type="text"
					id="category"
					class="flex-1"
					bind:value={newCategory}
					disabled={isTryingToStart}
				/>
			</div>

			<div class="flex items-center gap-1">
				<label for="rules">Additional Rules</label>
				<input
					type="text"
					id="rules"
					class="flex-1"
					bind:value={newRules}
					disabled={isTryingToStart}
				/>
			</div>

			<fieldset
				class="flex flex-col gap-2 border-solid border-2 border-surfaceVariant-dark rounded-md px-4 py-2 mb-1"
			>
				<legend class="bg-background-dark text-surfaceVariant-dark px-2 rounded-md text-title-sm"
					>PREVIEW</legend
				>
				<div class="text-body-md leading-none">{newCategoryMessage}</div>
				<div class="text-body-sm leading-none">{newRules}</div>
			</fieldset>

			<div class="flex items-center gap-1">
				<label for="questionCommand">Number of questions</label>
				<input
					type="range"
					id="numOfQuestions"
					class="flex-1"
					bind:value={numOfQuestions}
					min="3"
					max="32"
					step="1"
					disabled={isTryingToStart || isStarted}
				/>
				<span>{numOfQuestions}</span>
			</div>

			<div class="flex items-center gap-1">
				<label for="questionCommand">Question command</label>
				<input
					type="text"
					id="questionCommand"
					class="flex-1"
					bind:value={newQuestionCommand}
					disabled={isTryingToStart}
				/>
			</div>

			{#if startError}
				<p class="text-error-dark">{startError}</p>
			{/if}

			{#if isStarted}
				<div class="flex justify-end gap-2 mt-2">
					<Button
						type="submit"
						variant="filled"
						on:click={applySettings}
						disabled={newQuestionCommand === questionCommand}>Apply</Button
					>
					<Button variant="outlined" on:click={() => (showSettings = false)}>Cancel</Button>
				</div>
			{:else}
				<Button
					type="submit"
					variant="filled"
					class="mt-2"
					on:click={startGame}
					disabled={!canStartGame || isTryingToStart}
					>{#if isTryingToStart}
						Starting game...
					{:else}
						Start game
					{/if}</Button
				>
			{/if}
		</form>
	{/if}

	{#if isStarted && !showSettings}
		<div class="flex flex-1 relative">
			<div class="flex-1 flex flex-col">
				<h4 class="text-3xl text-center mt-2">{categoryMessage}</h4>
				<h5 class="text-2xl text-center">{rules}</h5>

				<div class="flex mt-4 mx-4">
					<p class="opacity-60 text-body-lg mb-2 flex-1">
						Previous questions, answers, and guesses
					</p>
					<p
						class={clsx(
							"text-body-lg mb-2",
							remainingTries <= 1
								? "text-error-dark"
								: remainingTries <= 3
								? "text-warning-dark"
								: "text-onBackground-dark",
							remainingTries <= 1 && "animate-pulse"
						)}
					>
						{remainingTries}
						{remainingTries === 1 ? "try" : "tries"} remaining
					</p>
				</div>
				<div class="flex-1 relative">
					<div class="absolute h-full w-full overflow-y-auto flex flex-col">
						<table class="mx-8">
							<thead>
								<tr class="text-tertiary-dark">
									<th class="w-64 text-left">Chatter</th>
									<th class="text-left">Question</th>
									<th class="text-left">Answer</th>
									<th class="text-left">Guess</th>
								</tr>
							</thead>
							<tbody>
								{#each questionsAndAnswers as qna}
									<tr class="border-t border-outline-dark/20">
										<td style={`color: ${qna.chatterColor};`} class="font-bold py-2">
											{qna.chatterDisplayName ?? qna.chatter}
										</td>
										<td class="w-64">{qna.question}</td>
										<td class="w-56">{qna.answer}</td>
										<td>{qna.guess || "[skipped]"}</td>
									</tr>
								{/each}

								{#if chosenQuestion !== null}
									<tr class="py-2 opacity-60 border-t border-outline-dark/20">
										<td style={`color: ${chosenQuestion.color};`} class="font-bold py-2 px-2"
											>{chosenQuestion.displayName ?? chosenQuestion.username}
										</td>
										<td>{chosenQuestion.question}</td>
										<td>{pendingAnswer}</td>
										<td>{"..."}</td>
									</tr>
								{/if}
							</tbody>
						</table>
						{#if questionsAndAnswers.length === 0 && chosenQuestion === null}
							<div class="flex items-center text-lg opacity-30 gap-2 mx-auto my-auto">
								Look at the sidebar <span class="material-symbols-rounded">arrow_right_alt</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="w-[480px] flex flex-col">
				<div class="flex-1 flex flex-col">
					{#if state === "waiting_for_questions"}
						<div class="flex-1 flex flex-col items-center mx-4">
							<p class="text-3xl mb-2 mt-2 text-primary-dark animate-pulse text-center">
								Use the <code class="bg-surfaceVariant-dark px-1 rounded-md font-semibold"
									>{questionCommand}</code
								> command in chat to submit a question
							</p>
							<p class="text-secondary-dark text-body-lg text-center">
								<span class="material-symbols-rounded text-body-lg mr-2 mt-2">info</span><span
									>You can submit multiple questions but it does not increase your odds of being
									picked.
								</span>
							</p>

							<div class="mt-4 opacity-90 text-sm">
								{submittedQuestions.length} Questions Submitted
							</div>

							<div
								class="flex-1 mt-2 w-96 relative overflow-hidden bg-surfaceContainerLowest-dark/25 rounded-md py-1"
							>
								<div
									class="absolute top-0 left-0 gradient-mask-t-10 w-full h-full flex flex-col-reverse"
								>
									{#each submittedQuestions.slice(-16).reverse() as question}
										<div class="text-sm text-onBackground-dark py-0.5 px-2">
											<span style={`color: ${question.color};`} class="-mr-0.5 font-bold"
												>{question.displayName ?? question.username}</span
											>
											<span>: {questionCommand} {question.question}</span>
										</div>
									{/each}
								</div>
							</div>

							<Button
								class="mt-4"
								variant="filled"
								on:click={pickQuestion}
								disabled={submittedQuestions.length === 0}
								symbol="shuffle"
								title={submittedQuestions.length === 0
									? "Waiting for more questions from chat..."
									: undefined}>Pick random question</Button
							>
						</div>
					{/if}

					{#if state === "answering" && chosenQuestion}
						<div class="flex-1 flex flex-col items-center justify-center">
							<div class="text-md text-onBackground-dark py-0.5 px-2 w-96 my-1">
								<span style={`color: ${chosenQuestion.color};`} class="-mr-0.5 font-bold"
									>{chosenQuestion.displayName ?? chosenQuestion.username}</span
								>
								<span>: {questionCommand} {chosenQuestion.question}</span>
							</div>

							<div class="flex items-center gap-1 mt-8">
								<label for="answer">Your answer</label>
								<input
									id="answer"
									class="flex-1"
									type="text"
									bind:value={pendingAnswer}
									on:keydown={(e) => {
										e.key === "Enter" && submitAnswer();
									}}
								/>
							</div>

							<div class="flex gap-2 mt-4">
								<Button variant="outlined" on:click={pickQuestion} symbol="shuffle"
									>Pick a different question</Button
								>
								<Button
									class="flex-1"
									variant="filled"
									type="submit"
									on:click={submitAnswer}
									disabled={!canSubmitAnswer}>Submit Answer</Button
								>
							</div>
						</div>
					{/if}

					{#if state === "waiting_for_guess" && chosenQuestion}
						<div class="flex flex-1 flex-col items-center w-full max-w-md mx-auto">
							<p class="animate-pulse">
								Waiting for guess from {chosenQuestion.displayName || chosenQuestion.username}...
							</p>

							<div class="mt-2 w-full flex-1 relative py-1">
								<div
									class="absolute inset-0 overflow-y-auto bg-surfaceContainerLowest-dark/40 rounded-lg flex flex-col-reverse"
								>
									{#each guessMessages.reverse() as guess}
										<div
											class="flex text-md text-onBackground-dark py-0.5 px-2 gap-2 [&:has(button:hover)]:bg-surfaceContainerHigh-dark"
										>
											<Button
												variant="filled"
												class="py-0 h-5 mt-0.5 w-16"
												on:click={() => {
													pickGuess(guess);
												}}>Select</Button
											>
											<div class="flex-1">
												<span style={`color: ${chosenQuestion.color};`} class="-mr-0.5 font-bold"
													>{chosenQuestion.displayName ?? chosenQuestion.username}</span
												>
												<span>: {guess}</span>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<p class="text-secondary-dark mt-2 mx-8 text-center">
								Click the <span
									class="bg-primaryContainer-dark text-onPrimaryContainer-dark px-2 rounded-full"
									>Select</span
								> button next to the chat message to pick it as the guess
							</p>

							<Button class="mt-4 px-0" variant="outlined" on:click={() => pickGuess(null)}
								>Skip Guess</Button
							>
						</div>
					{/if}

					{#if state === "guess_picked" && chosenGuess && chosenQuestion}
						<div class="flex flex-1 flex-col items-center justify-center max-w-sm w-full mx-auto">
							<div class="flex">
								<Button symbol="arrow_back" on:click={() => pickAnotherGuess()}
									>Pick another guess</Button
								>
							</div>

							<div class="flex text-xl text-onBackground-dark py-0.5 px-2 mt-2">
								<div class="flex-1">
									<span style={`color: ${chosenQuestion.color};`} class="-mr-0.5 font-bold"
										>{chosenQuestion.displayName ?? chosenQuestion.username}</span
									>
									<span>: {chosenGuess}</span>
								</div>
							</div>

							<div class="flex gap-2 mt-8">
								<Button
									on:click={() => guessIs(true)}
									symbol="check"
									color="success"
									variant="filled">Correct</Button
								>
								<Button
									on:click={() => guessIs(false)}
									symbol="close"
									color="error"
									variant="filled">Wrong</Button
								>
							</div>
						</div>
					{/if}

					{#if state === "chat_won"}
						<div
							class="flex flex-col items-center justify-center flex-1 bg-successContainer-dark text-onsuccessContainer-dark mx-4 rounded-lg"
						>
							<p class="text-4xl font-bold pulse">Chat Won!</p>
							<p class="text-title-md mb-16">
								The answer was: {questionsAndAnswers[questionsAndAnswers.length - 1].guess}
							</p>

							<Button variant="filled" on:click={reset}>Play Again</Button>
						</div>
					{/if}

					{#if state === "chat_lost"}
						<div
							class="flex flex-col items-center justify-center flex-1 bg-errorContainer-dark text-onerrorContainer-dark mx-4 rounded-lg"
						>
							<p class="text-4xl font-bold pulse">Chat Lost!</p>
							<p class="text-title-md mb-16">
								{streamerUsername} will now reveal the answer...
							</p>

							<Button variant="filled" on:click={reset}>Play Again</Button>
						</div>
					{/if}
				</div>
				<div
					class="outline-dashed outline-outline-dark h-80 flex flex-col justify-center items-center mt-8 m-4 opacity-50 resize-y"
				>
					<p>camera goes here</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	td,
	th {
		@apply px-2;
	}
</style>
