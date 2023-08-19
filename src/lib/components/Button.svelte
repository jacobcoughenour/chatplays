<script>
	import clsx from "clsx";
	import LoadingSpinner from "./LoadingSpinner.svelte";

	/**
	 * When href is defined, the button will be rendered as an anchor tag.
	 * @type {string | undefined}
	 */
	export let href = undefined;

	/**
	 * @default "text"
	 * @type {"text" | "outlined" | "tonal" | "filled" | "elevated"}
	 */
	export let variant = "text";

	/**
	 * @default "primary"
	 * @type {"primary" | "tertiary" | "success" | "error"}
	 */
	export let color = "primary";

	/**
	 * @type {undefined | string}
	 */
	export let symbol = undefined;

	/**
	 * @type {"outlined" | "rounded" | "rounded-filled"}
	 */
	export let symbol_variant = "rounded";

	/**
	 * @type {"normal" | "small" | "large" | "xl" | "2xl"}
	 */
	export let symbol_size = "normal";

	/**
	 * @type {boolean}
	 */
	export let loading = false;

	let disabled = false;
	$: disabled = loading || $$restProps.disabled === true;
	let isIconButton = false;
	$: isIconButton = !!symbol && $$slots.default === undefined;
</script>

<svelte:element
	this={href ? "a" : "button"}
	href={loading ? undefined : href}
	{...$$restProps}
	class={clsx(
		"inline-flex justify-center rounded-full py-2.5 text-label-lg transition-colors",
		// text color
		!disabled &&
			variant !== "filled" &&
			color === "primary" &&
			"text-primary-light dark:text-primary-dark",
		!disabled &&
			variant !== "filled" &&
			color === "tertiary" &&
			"text-tertiary-light dark:text-tertiary-dark",
		!disabled &&
			variant !== "filled" &&
			color === "success" &&
			"text-success-light dark:text-success-dark",
		!disabled &&
			variant !== "filled" &&
			color === "error" &&
			"text-error-light dark:text-error-dark",
		// disabled
		disabled && "text-onSurface-light/[38%] dark:text-onSurface-dark/[38%] shadow-none",
		disabled &&
			variant !== "text" &&
			variant !== "outlined" &&
			"bg-onSurface-light/[12%] dark:bg-onSurface-dark/[12%]",
		// hover states
		!disabled &&
			(variant === "text" || variant === "elevated" || variant === "outlined") &&
			(color === "primary"
				? "hover:bg-primary-light/[theme(surfaceElevations[1])] hover:dark:bg-primary-dark/[theme(surfaceElevations[1])] focus:bg-primary-light/[theme(surfaceElevations[2])] focus:dark:bg-primary-dark/[theme(surfaceElevations[2])] active:bg-primary-light/[theme(surfaceElevations[2])] active:dark:bg-primary-dark/[theme(surfaceElevations[2])]"
				: color === "tertiary"
				? "hover:bg-tertiary-light/[theme(surfaceElevations[1])] hover:dark:bg-tertiary-dark/[theme(surfaceElevations[1])] focus:bg-tertiary-light/[theme(surfaceElevations[2])] focus:dark:bg-tertiary-dark/[theme(surfaceElevations[2])] active:bg-tertiary-light/[theme(surfaceElevations[2])] active:dark:bg-tertiary-dark/[theme(surfaceElevations[2])]"
				: color === "success"
				? "hover:bg-success-light/[theme(surfaceElevations[1])] hover:dark:bg-success-dark/[theme(surfaceElevations[1])] focus:bg-success-light/[theme(surfaceElevations[2])] focus:dark:bg-success-dark/[theme(surfaceElevations[2])] active:bg-success-light/[theme(surfaceElevations[2])] active:dark:bg-success-dark/[theme(surfaceElevations[2])]"
				: color === "error" &&
				  "hover:bg-error-light/[theme(surfaceElevations[1])] hover:dark:bg-error-dark/[theme(surfaceElevations[1])] focus:bg-error-light/[theme(surfaceElevations[2])] focus:dark:bg-error-dark/[theme(surfaceElevations[2])] active:bg-error-light/[theme(surfaceElevations[2])] active:dark:bg-error-dark/[theme(surfaceElevations[2])]"),
		// filled only
		variant === "filled" &&
			!disabled &&
			(color === "primary"
				? "bg-primary-light dark:bg-primary-dark text-onPrimary-light dark:text-onPrimary-dark"
				: color === "tertiary"
				? "bg-tertiary-light dark:bg-tertiary-dark text-onTertiary-light dark:text-onTertiary-dark"
				: color === "success"
				? "bg-success-light dark:bg-success-dark text-onsuccess-light dark:text-onsuccess-dark"
				: color === "error" &&
				  "bg-error-light dark:bg-error-dark text-onError-light dark:text-onError-dark"),
		(variant === "filled" || variant === "tonal") && "shadow-sm hover:shadow-shadow/60",
		// tonal only
		!disabled &&
			variant === "tonal" &&
			(color === "primary"
				? "bg-secondaryContainer-light dark:bg-secondaryContainer-dark hover:bg-primaryOnSecondaryContainer-2-light hover:dark:bg-primaryOnSecondaryContainer-2-dark"
				: color === "tertiary"
				? "bg-tertiaryContainer-light dark:bg-tertiaryContainer-dark hover:bg-primaryOnTertiaryContainer-2-light hover:dark:bg-primaryOnTertiaryContainer-2-dark"
				: color === "success"
				? "bg-successContainer-light dark:bg-successContainer-dark hover:bg-primaryOnSuccessContainer-2-light hover:dark:bg-primaryOnSuccessContainer-2-dark"
				: color === "error" &&
				  "bg-errorContainer-light dark:bg-errorContainer-dark hover:bg-primaryOnErrorContainer-2-light hover:dark:bg-primaryOnErrorContainer-2-dark"),
		// elevated only
		variant === "elevated" && "shadow-sm shadow-shadow-light/50 dark:shadow-shadow-dark/50",
		variant === "elevated" &&
			!disabled &&
			"hover:shadow-md active:shadow-md focus:shadow-md bg-surfaceContainerLow-light/[theme(surfaceElevations[0])] dark:bg-surfaceContainerLow-dark/[theme(surfaceElevations[0])]",
		// outlined only
		variant === "outlined" && "border border-solid border-outline",
		variant === "outlined" &&
			disabled &&
			"border-onSurface-light/[12%] dark:border-onSurface-dark/[12%]",
		$$restProps.class
	)}
	on:click
	on:change
	on:keydown
	on:keyup
	on:touchstart
	on:touchend
	on:touchcancel
	on:mouseenter
	on:mouseleave
	role={href ? "button" : undefined}
>
	{#if loading}
		<LoadingSpinner size="20px" class="flex-1 absolute" />
	{/if}
	<span
		class={clsx(
			"flex items-center justify-center",
			loading && "opacity-0",
			// text only
			!isIconButton && variant === "text" && "px-4",
			!isIconButton && variant === "text" && symbol && "pl-3",
			// icon button only
			isIconButton && "px-2.5",
			// padding
			!isIconButton && variant !== "text" && "px-6",
			!isIconButton && variant !== "text" && symbol && "pl-4"
		)}
		>{#if symbol}<span
				class={clsx(
					`material-symbols-${symbol_variant}`,
					{
						small: "text-[16px]",
						normal: "text-[20px]",
						large: "text-[24px]",
						xl: "text-[28px]",
						"2xl": "text-[32px]"
					}[symbol_size],
					!isIconButton && "mr-2",
					loading && "opacity-0"
				)}>{symbol}</span
			>{/if}<span><slot /></span></span
	>
</svelte:element>
