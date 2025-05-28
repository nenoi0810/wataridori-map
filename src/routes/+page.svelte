<script lang="ts">
	import { CircleLayer, GeoJSONSource, MapLibre } from 'svelte-maplibre-gl';
	import type { GeoJSON } from 'geojson';
	import observasion from '$lib/observation.json';

	let sliderValue = $state(5);
	let selectedOption = $state('オオハクチョウ');
</script>

<MapLibre
	zoom={4}
	center={[137.5, 37.5]}
	class="h-[800px] w-full"
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
	<GeoJSONSource data={observasion as GeoJSON}>
		<CircleLayer
			id="observations"
			paint={{
				'circle-color': '#FF0000',
				'circle-radius': 5
			}}
		/>
	</GeoJSONSource>
</MapLibre>

<div class="flex justify-center gap-8 mt-4 items-center">
	<div class="flex items-center gap-2">
		<span>{sliderValue}月</span>
		<input type="range" min="1" max="12" bind:value={sliderValue} class="slider w-[200px]" id="myRange" />
	</div>
	<div class="flex items-center gap-2">
		<span>鳥の種類：</span>
		<select bind:value={selectedOption} class="select p-1 border rounded w-[150px]">
			<option value="オオハクチョウ">オオハクチョウ</option>
			<option value="コハクチョウ">コハクチョウ</option>
			<option value="カモ類">カモ類</option>
		</select>
	</div>
</div>
