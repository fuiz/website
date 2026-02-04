<script>
	/** @type {{ value: number; duration: number; delay: number; }}*/
	let { value, duration, delay } = $props();
</script>

<div style:--num={value} style:--duration="{duration}ms" style:--delay="{delay}ms"></div>

<style>
	@property --num {
		syntax: '<integer>';
		initial-value: 0;
		inherits: false;
	}

	div {
		transition: --num var(--duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay);
		counter-reset: num var(--num);
	}

	div::after {
		content: counter(num);
	}
</style>
