<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	import DarkModeSwitcher from '$lib/DarkModeSwitcher.svelte';

	import diversity from '$lib/assets/diversity.svg';
	import balance from '$lib/assets/balance.svg';
	import Icon from './Icon.svelte';
	import Anchor from './Anchor.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
</script>

<div
	style:border-top="2px solid #00000080"
	style:text-align="center"
	style:width="100%"
	style:font-size="0.75em"
	style:box-sizing="border-box"
	style:font-family="Poppins"
	style:padding="8px"
	style:display="flex"
	style:align-items="center"
	style:gap="10px"
	style:justify-content="center"
	style:flex-wrap="wrap"
>
	<Anchor href={'/credits'}>
		<div style:display="inline-flex" style:align-items="center" style:gap="0.2em">
			<Icon src={diversity} alt={m.community()} size="1em" />
			<div>{m.community()}</div>
		</div>
	</Anchor>
	<Anchor href="https://gitlab.com/fuiz/website">
		<div style:display="inline-flex" style:align-items="center" style:gap="0.2em">
			<Icon src={balance} alt={m.open_source()} size="1em" />
			<div>GNU AGPLv3</div>
		</div>
	</Anchor>
	<LanguageSwitcher up={true} />
	<DarkModeSwitcher />
</div>
