<script lang="ts">
	import { GeoJSONSource, ImageLoader, MapLibre, Popup, SymbolLayer } from 'svelte-maplibre-gl';
	import observasion from '$lib/observation.json';
	import Slider from './Slider.svelte';

	import { observationData, speciesList } from '$lib/loadcsv';
	import type { Map as MapLibreMap } from 'maplibre-gl';

	// 2024-01 = 1, 2024-12 = 12, 2025-01 = 13, ...
	let sliderValue = $state(9);

	// 整数値 -> 年月文字列
	let yearmonth = $derived(() => {
		const startYear = 2024;
		const startMonth = 1;
		const year = Math.floor((sliderValue - 1) / 12) + startYear;
		const month = ((sliderValue - 1) % 12) + startMonth;
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
					['*', 0.008, ['ln', data]], // 1以上なら対数スケールでサイズを決定
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

	let mapInstance: MapLibreMap | undefined = $state(undefined);
	let popupOpen = $state(false);
	let popupLnglat = $state({ lng: 0, lat: 0 });
	let popupContent = $state('');
	function onClick(event: any) {
		const features = mapInstance?.queryRenderedFeatures(event.point);

		if (!features || features.length === 0) {
			popupOpen = false;
			return;
		}
		// 最初のフィーチャーを取得
		const feature = features[0];
		if (feature) {
			popupContent = `調査地: ${feature.properties.name}`;
			popupOpen = true;
			popupLnglat = { lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] };
		} else {
			popupOpen = false;
		}
	}
</script>

<div class="absolute top-4 left-4 z-10 flex flex-col rounded-lg bg-white p-4">
	<button
		onclick={() => (selectedOption = 'total')}
		class={`btn btn-primary mr-2 rounded-lg ${selectedOption === 'total' ? 'bg-green-400' : ''}`}
		disabled={selectedOption === 'total'}
	>
		全種合計
	</button>
	<div class="py-2"></div>
	<div class="flex h-[400px] flex-col overflow-auto">
		{#each speciesList as species}
			<button
				onclick={() => (selectedOption = species)}
				class={`btn btn-primary mr-2 rounded-lg ${selectedOption === species ? 'bg-green-400' : ''}`}
				disabled={selectedOption === species}
			>
				{species}
			</button>
		{/each}
	</div>
</div>

<MapLibre
	bind:map={mapInstance}
	zoom={5}
	center={[142, 43]}
	class="h-screen w-full"
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
	onclick={(event) => {
		onClick(event);
		popupOpen = true;
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
					'text-font': ['LINESeedJP_OTF_Rg'],
					'text-field': textField(),
					'icon-allow-overlap': true,
					'text-allow-overlap': true
				}}
				paint={{
					'text-halo-width': 2,
					'text-color': '#2a2',
					'text-halo-color': '#fff'
				}}
				filter={filter()}
			></SymbolLayer>
		</ImageLoader>
	</GeoJSONSource>
	<Popup class="text-black" bind:open={popupOpen} lnglat={popupLnglat}>
		<span>{popupContent}</span>
	</Popup>
</MapLibre>
<div
	class="absolute bottom-20 left-1/2 flex w-3/4 min-w-[320px] -translate-x-1/2 transform justify-center rounded-lg bg-white p-4"
>
	<Slider bind:value={sliderValue} popupText={yearmonth()} range={[1, 16]} />
</div>
