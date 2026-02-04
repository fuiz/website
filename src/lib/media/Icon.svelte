<script>
	/** @type {{src: string, alt: string, size: string}}*/
	let { src, alt, size } = $props();

	let urlString = $derived(`url("${src}")`);
</script>

<div
	style:width={size}
	style:height={size}
	style:aspect-ratio="1/1"
	style:display="flex"
	style:-webkit-mask-size="cover"
	style:color="inherit"
	style:background="currentColor"
	style:mask-image={urlString}
	style:mask-position="center"
	style:mask-size="contain"
	style:mask-repeat="no-repeat"
	style:-webkit-mask-image={urlString}
	title={alt}
></div>
