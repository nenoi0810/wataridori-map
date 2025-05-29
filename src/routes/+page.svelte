<script lang="ts">
	import {
		CircleLayer,
		GeoJSONSource,
		ImageLoader,
		MapLibre,
		SymbolLayer
	} from 'svelte-maplibre-gl';
	import observasion from '$lib/observation.json';

	import { observationData, speciesList } from '$lib/loadcsv';

	// 2024-01 = 1, 2024-12 = 12, 2025-01 = 13, ...
	let sliderValue = $state(9);

	// 整数値 -> 年月文字列
	let yearmonth = $derived(() => {
		const year = Math.floor((sliderValue - 1) / 12) + 2024;
		const month = ((sliderValue - 1) % 12) + 1;
		return `${year}-${String(month).padStart(2, '0')}`;
	});

	const iconSize = $derived(() => {
		let expression: any = ['case'];
		Object.keys(observationData).forEach((key) => {
			const data = observationData[key]?.[yearmonth()]?.[selectedOption] ?? 0;
			expression.push(
				['==', ['get', 'id'], Number(key)],
				// @ts-ignore
				['*', 0.01, ['ln', data]]
			);
		});
		expression.push(0);
		return expression;
	});

	let selectedOption = $state('total');
</script>

<div class="flex">
	<div>
		{yearmonth()}:
		<input type="range" min="1" max="16" bind:value={sliderValue} class="slider" id="myRange" />
	</div>
	<select bind:value={selectedOption} class="select">
		<option value="total">合計</option>
		{#each speciesList as species}
			<option value={species}>{species}</option>
		{/each}
	</select>
</div>

<MapLibre
	zoom={5}
	center={[142, 43]}
	class="h-[calc(100vh-64px)] w-full"
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
		<ImageLoader
			images={{
				hakutyo: './hakutyo.PNG'
			}}
		>
			<SymbolLayer
				layout={{
					'icon-image': 'hakutyo',
					'icon-rotate': 180,
					'icon-size': iconSize(),
					'icon-overlap': 'always'
				}}
			/>
		</ImageLoader>
	</GeoJSONSource>
</MapLibre>
