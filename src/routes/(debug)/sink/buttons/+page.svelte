<script>
	import Button from "$lib/components/Button.svelte";
	// import { theme, themeSetting } from "$lib/storage";

	let loading = false;

	const hrefs = [undefined, "/sink"];

	const colors = ["primary", "tertiary", "success", "error"];

	const variants = ["Default", "Filled", "Tonal", "Elevated", "Outlined", "Text"];

	const states = [false, true];

	/**
	 * @type {[(undefined | "add"), boolean][]}
	 */
	const contents = [
		[undefined, true],
		["add", true],
		["add", false]
	];
</script>

<!-- <label>
	Theme
	<select
		value={$theme}
		on:change={(e) => {
			themeSetting.set(e.target.value);
		}}
	>
		<option value="system">System</option>
		<option value="dark">Dark</option>
		<option value="light">Light</option>
	</select>
</label> -->

<label>
	loading
	<input type="checkbox" bind:checked={loading} />
</label>

<div class="mt-4 space-y-2">
	{#each hrefs as href}
		{#each contents as content}
			{#each colors as color}
				{#each states as disabled}
					<div class="flex space-x-2 items-center">
						{#each variants as variant}
							{#if content[1]}
								<Button
									{href}
									{color}
									{disabled}
									{loading}
									symbol={content[0]}
									variant={variant === "Default" ? undefined : variant.toLowerCase()}
									>{variant}</Button
								>{:else}<Button
									{href}
									{color}
									{disabled}
									{loading}
									symbol={content[0]}
									variant={variant === "Default" ? undefined : variant.toLowerCase()}
								/>{/if}
						{/each}
					</div>
				{/each}
			{/each}
		{/each}
	{/each}
</div>
