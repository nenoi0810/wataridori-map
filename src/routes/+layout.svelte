<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Wataridori Map</title>
	<meta name="description" content="渡り鳥観測データの可視化" />
</svelte:head>

{@render children()}
