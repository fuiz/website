<script>
	import * as m from '$lib/paraglide/messages.js';

	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';

	import diversity from '$lib/assets/icons/diversity.svg';
	import balance from '$lib/assets/icons/balance.svg';
	import Icon from '$lib/media/Icon.svelte';
	import Anchor from '$lib/navigation/Anchor.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
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
	<Anchor href={localizeHref('/credits')}>
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
	<LanguageSwitcher id="footer" up={true} />
	<DarkModeSwitcher />
</div>
