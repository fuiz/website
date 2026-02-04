<script>
	/** @type {{
	 * foregroundColor: string,
	 * backgroundColor: string,
	 * backgroundDeepColor: string,
	 * disabled?: boolean,
	 * active?: boolean,
	 * type?: 'button' | 'submit' | 'reset' | undefined,
	 * height?: string | undefined,
	 * children?: import('svelte').Snippet,
	 * onclick?: () => void
	 * }} */
	let {
		foregroundColor,
		backgroundColor,
		backgroundDeepColor,
		disabled = false,
		active = true,
		type = undefined,
		height = undefined,
		children,
		onclick
	} = $props();
</script>

{#if active}
	<button
		{type}
		class="button-root"
		style:display="flex"
		style:background="none"
		style:border="none"
		style:color="inherit"
		style:box-sizing="border-box"
		style:padding="0.3em 0 0 0"
		style:width="100%"
		style:height={height ?? 'fit-content'}
		style:font="inherit"
		style:outline="none"
		disabled={disabled || !active}
		onclick={() => {
			if (onclick) onclick();
		}}
	>
		<div
			style:background={disabled ? '#636363' : backgroundDeepColor}
			style:transition="background 300ms linear"
			style:border-radius="0.7em"
			style:transform="translateY(0)"
			style:width="100%"
			style:height="100%"
		>
			<div
				class="front"
				style:background-color={disabled ? '#737373' : backgroundColor}
				style:border="0.1em solid {disabled ? '#636363' : backgroundDeepColor}"
				style:border-radius="0.7em"
				style:box-sizing="border-box"
				style:color={foregroundColor}
				style:width="100%"
				style:height="100%"
			>
				{@render children?.()}
			</div>
		</div>
	</button>
{:else}
	<div
		class="button-root"
		style:display="flex"
		style:background="none"
		style:border="none"
		style:color="inherit"
		style:box-sizing="border-box"
		style:padding="0.3em 0 0 0"
		style:width="100%"
		style:height={height ?? 'fit-content'}
		style:font="inherit"
		style:outline="none"
	>
		<div
			style:background={disabled ? '#636363' : backgroundDeepColor}
			style:transition="background 300ms linear"
			style:border-radius="0.7em"
			style:transform="translateY(0)"
			style:width="100%"
			style:height="100%"
		>
			<div
				class="front"
				style:background-color={disabled ? '#737373' : backgroundColor}
				style:border="0.1em solid {disabled ? '#636363' : backgroundDeepColor}"
				style:border-radius="0.7em"
				style:box-sizing="border-box"
				style:color={foregroundColor}
				style:width="100%"
				style:height="100%"
			>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.button-root .front {
		transform: translateY(-0.15em);
		transition:
			transform 150ms,
			background-color 300ms linear,
			border-color 300ms linear;
	}

	.button-root:active:not(:disabled) .front {
		transform: translateY(0em);
	}

	.button-root:where(:global(:hover, :focus)) .front {
		transform: translateY(-0.3em);
	}
</style>
