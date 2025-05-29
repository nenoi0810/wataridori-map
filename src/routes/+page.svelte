<script lang="ts">
	import { GeoJSONSource, ImageLoader, MapLibre, Popup, SymbolLayer } from 'svelte-maplibre-gl';
	import observasion from '$lib/observation.json';
	import Slider from './Slider.svelte';

	import { observationData, speciesList } from '$lib/loadcsv';
	import type { Map as MapLibreMap } from 'maplibre-gl';

	// 2024-01 = 1, 2024-12 = 12, 2025-01 = 13, ...
	let sliderValue = $state(9);

	// 整数値 -> 年月文字列の変換関数
	export function yearmonthFormatter(val: number): string {
		const startYear = 2023;
		const startMonth = 1;
		const year = Math.floor((val - 1) / 12) + startYear;
		const month = ((val - 1) % 12) + startMonth;
		return `${year}-${String(month).padStart(2, '0')}`;
	}

	// スライダー表示用の年月フォーマット関数
	export function yearmonthDisplay(val: number): string {
		const startYear = 2023;
		const startMonth = 1;
		const year = Math.floor((val - 1) / 12) + startYear;
		const month = ((val - 1) % 12) + startMonth;
		return `${year}/${String(month).padStart(2, '0')}`;
	}

	// 整数値 -> 年月文字列
	let yearmonth = $derived(() => yearmonthFormatter(sliderValue));

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

<div
	class="xs:block absolute top-4 left-4 z-10 rounded-xl bg-[#ffffff90] p-6 shadow-xl backdrop-blur-sm"
>
	<h1
		class="bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-wide text-green-700 drop-shadow-lg"
	>
		🦅 Wataridori Map
	</h1>
	<p class="mt-2 text-sm text-gray-700 opacity-80">渡り鳥観測データの可視化</p>
</div>

<div
	class="absolute top-36 left-4 z-10 flex flex-col rounded-lg bg-[#ffffff90] p-4 shadow-lg backdrop-blur-sm"
>
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
	zoom={4}
	center={[140, 37]}
	class="h-screen w-full"
	maxBounds={[
		[120, 15], // Southwest corner (longitude, latitude)
		[150, 55] // Northeast corner (longitude, latitude)
	]}
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
	class="absolute bottom-10 left-1/2 flex w-3/4 min-w-[320px] -translate-x-1/2 transform justify-center rounded-lg bg-[#ffffff90] p-4 backdrop-blur-sm"
>
	<Slider bind:value={sliderValue} range={[9, 28]} formatter={yearmonthDisplay} />
</div>
