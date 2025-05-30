<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Wataridori Map - 渡り鳥観測データの可視化</title>
	<meta name="description" content="Wataridori Map - 渡り鳥観測データの可視化" />
</svelte:head>

{@render children()}
