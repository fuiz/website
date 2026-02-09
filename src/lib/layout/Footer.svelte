<script>
	import Anchor from '$lib/navigation/Anchor.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import Balance from '~icons/material-symbols/balance';
	import Diversity1 from '~icons/material-symbols/diversity-1';
	import Policy from '~icons/material-symbols/policy';
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
			<Diversity1 height="1em" title={m.community()} />
			<div>{m.community()}</div>
		</div>
	</Anchor>
	<Anchor href="https://gitlab.com/fuiz/website">
		<div style:display="inline-flex" style:align-items="center" style:gap="0.2em">
			<Balance height="1em" title={m.open_source()} />
			<!-- i18n-ignore -->
			<div>GNU AGPLv3</div>
		</div>
	</Anchor>
	<Anchor href={localizeHref('/privacy')}>
		<div style:display="inline-flex" style:align-items="center" style:gap="0.2em">
			<Policy height="1em" title={m.privacy_policy()} />
			<div>{m.privacy_policy()}</div>
		</div>
	</Anchor>
	<LanguageSwitcher id="footer" up={true} />
	<DarkModeSwitcher />
</div>
