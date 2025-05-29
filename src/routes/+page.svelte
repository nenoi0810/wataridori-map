<script lang="ts">
	import { GeoJSONSource, ImageLoader, MapLibre, SymbolLayer } from 'svelte-maplibre-gl';
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
			// @ts-ignore
			const data = observationData[key]?.[yearmonth()]?.[selectedOption] ?? 0;
			expression.push(
				['==', ['get', 'id'], Number(key)],
				// @ts-ignore
				[
					'case',
					['==', data, 0],
					0, // 0以下ならサイズ0
					['<', data, 1],
					0.02, // 1未満ならそのままサイズ
					['>', data, 1],
					['*', 0.01, ['ln', data]], // 1以上なら対数スケールでサイズを決定
					0
				]
			);
		});
		expression.push(0);
		return expression;
	});

	const textField = $derived(() => {
		let expression: any = ['case'];
		Object.keys(observationData).forEach((key) => {
			// @ts-ignore
			const data = observationData[key]?.[yearmonth()]?.[selectedOption] ?? 0;
			expression.push(
				['==', ['get', 'id'], Number(key)],
				// @ts-ignore
				['literal', `${Math.round(data)}`]
			);
		});
		expression.push('');
		return expression;
	});

	const filter = $derived(() => {
		// > 0
		let expression: any = ['case'];
		Object.keys(observationData).forEach((key) => {
			// @ts-ignore
			const data = observationData[key]?.[yearmonth()]?.[selectedOption] ?? 0;
			expression.push(['==', ['get', 'id'], Number(key)], ['>', data, 0]);
		});
		expression.push(true);
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
		glyphs: 'https://mierune.github.io/fonts/{fontstack}/{range}.pbf',
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
	<GeoJSONSource data={observasion as any}>
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
					'text-font': ['Noto Sans CJK JP Regular'],
					'text-field': textField(),
					'icon-allow-overlap': true,
					'text-allow-overlap': true
				}}
				paint={{
					'text-halo-width': 1,
					'text-color': '#f00',
					'text-halo-color': '#fff'
				}}
				filter={filter()}
			/>
		</ImageLoader>
	</GeoJSONSource>
</MapLibre>
