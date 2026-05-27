<script lang="ts">
	import Anchor from '$lib/navigation/Anchor.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import DarkModeSwitcher from '$lib/ui/DarkModeSwitcher.svelte';
	import LanguageSwitcher from '$lib/ui/LanguageSwitcher.svelte';
	import Balance from '~icons/material-symbols/balance';
	import Description from '~icons/material-symbols/description';
	import Diversity1 from '~icons/material-symbols/diversity-1';
	import Policy from '~icons/material-symbols/policy';
</script>

<div class="footer">
	<Anchor href={localizeHref('/credits')}>
		<div class="link">
			<Diversity1 height="1em" title={m.community()} />
			<div>{m.community()}</div>
		</div>
	</Anchor>
	<Anchor href="https://gitlab.com/fuiz/website">
		<div class="link">
			<Balance height="1em" title={m.open_source()} />
			<!-- i18n-ignore -->
			<div>GNU AGPLv3</div>
		</div>
	</Anchor>
	<Anchor href={localizeHref('/privacy')}>
		<div class="link">
			<Policy height="1em" title={m.privacy_policy()} />
			<div>{m.privacy_policy()}</div>
		</div>
	</Anchor>
	<Anchor href={localizeHref('/terms')}>
		<div class="link">
			<Description height="1em" title={m.terms_of_service()} />
			<div>{m.terms_of_service()}</div>
		</div>
	</Anchor>
	<LanguageSwitcher id="footer" up={true} />
	<DarkModeSwitcher />
</div>

<style>
	.footer {
		border-top: 1px solid #00000080;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
		padding: 8px;
		display: flex;
		align-items: center;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 0.2em;
	}
</style>
