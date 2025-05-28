<script lang="ts">
	import { CircleLayer, GeoJSONSource, MapLibre } from 'svelte-maplibre-gl';
	import observasion from '$lib/observation.json';

	let sliderValue = $state(5);
	let selectedOption = $state('オオハクチョウ');
</script>

<div class="flex">
	<div>
		{sliderValue}月:
		<input type="range" min="1" max="12" bind:value={sliderValue} class="slider" id="myRange" />
	</div>
	<select bind:value={selectedOption} class="select">
		<option value="オオハクチョウ">オオハクチョウ</option>
		<option value="コハクチョウ">コハクチョウ</option>
		<option value="カモ類">カモ類</option>
	</select>
</div>

<MapLibre
	zoom={5}
	center={[142, 43]}
	class="h-[400px]"
	style={{
		version: 8,
		sources: {
			osm: {
				type: 'raster',
				tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				tileSize: 256
			}
		},
		layers: [
			{
				id: 'osm',
				type: 'raster',
				source: 'osm'
			}
		]
	}}
>
	<GeoJSONSource data={observasion}>
		<CircleLayer
			id="observations"
			paint={{
				'circle-color': '#00BFFF',
				'circle-radius': 5
			}}
		/>
	</GeoJSONSource>
</MapLibre>
