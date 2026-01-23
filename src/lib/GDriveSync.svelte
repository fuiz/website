<script>
	import { onMount } from 'svelte';
	import { checkGDriveAuth, loginWithGDrive, logoutFromGDrive } from './storage/gdriveAuth';
	import FancyButton from './FancyButton.svelte';
	import Icon from './Icon.svelte';

	let isAuthenticated = $state(false);
	let isLoading = $state(true);

	onMount(async () => {
		isAuthenticated = await checkGDriveAuth();
		isLoading = false;
	});

	function handleClick() {
		if (isAuthenticated) {
			logoutFromGDrive();
		} else {
			loginWithGDrive();
		}
	}

	const label = $derived(isLoading ? '...' : isAuthenticated ? 'GDrive: On' : 'GDrive: Off');
</script>

<div>
	<FancyButton disabled={isLoading} onclick={handleClick}>
		<div class="button-content">
			<Icon size="1.2em" src="$lib/assets/drive.svg" alt="Google Drive" />
			<div>{label}</div>
		</div>
	</FancyButton>
</div>

<style>
	.button-content {
		display: flex;
		font-family: 'Poppins';
		white-space: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.2em;
		padding: 0.2em;
	}
</style>
