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
	let termsModalOpen = $state(false);
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
	<div class="flex items-start justify-between">
		<div>
			<h1
				class="bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-wide text-green-700 drop-shadow-lg"
			>
				🦅 Wataridori Map
			</h1>
			<div class="flex items-center">
				<p class="mt-2 text-sm text-gray-700 opacity-80">渡り鳥観測データの可視化</p>
				<button
					onclick={() => (termsModalOpen = true)}
					class="ml-4 mt-2 rounded-lg bg-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-300"
				>
					利用規約
				</button>
			</div>
		</div>
	</div>
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

<!-- 利用規約モーダル -->
{#if termsModalOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
	>
		<div class="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-2xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-800">利用規約</h2>
				<button
					onclick={() => (termsModalOpen = false)}
					class="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
				>
					✕
				</button>
			</div>
			<div class="prose max-w-none text-gray-700">
				<h3>1. データの利用について</h3>
				<p>
					本サイトで表示される渡り鳥観測データは、研究・教育目的で提供されています。商用利用については事前にお問い合わせください。
				</p>

				<h3>2. 免責事項</h3>
				<p>
					本サイトの情報は現状のまま提供されており、その正確性、完全性、有用性について一切の保証をいたしません。
				</p>

				<h3>3. プライバシー</h3>
				<p>
					本サイトでは個人情報の収集は行っておりません。ただし、アクセスログの記録を行う場合があります。
				</p>

				<h3>4. 変更</h3>
				<p>
					本利用規約は予告なく変更される場合があります。最新の規約は本サイトにてご確認ください。
				</p>

				<p class="mt-6 text-sm text-gray-500">最終更新: 2024年12月</p>
			</div>
			<div class="mt-6 flex justify-end">
				<button
					onclick={() => (termsModalOpen = false)}
					class="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
				>
					閉じる
				</button>
			</div>
		</div>
	</div>
{/if}
