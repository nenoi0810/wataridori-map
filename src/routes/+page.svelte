<script lang="ts">
	import { GeoJSONSource, ImageLoader, MapLibre, Popup, SymbolLayer } from 'svelte-maplibre-gl';
	import observasion from '$lib/observation.json';
	import Slider from './Slider.svelte';

	import { observationData, speciesList } from '$lib/loadcsv';
	import type { Map as MapLibreMap } from 'maplibre-gl';

	// 2024-01 = 1, 2024-12 = 12, 2025-01 = 13, ...
	let sliderValue = $state(9);

	// 現在の月のデータが全て0かどうかをチェック
	function isAllZeroData(yearmonth: string): boolean {
		let hasNonZeroData = false;
		Object.keys(observationData).forEach((key) => {
			// @ts-ignore
			const locationData = observationData[key]?.[yearmonth];
			if (locationData) {
				// @ts-ignore
				Object.values(locationData).forEach((value) => {
					if (typeof value === 'number' && value > 0) {
						hasNonZeroData = true;
					}
				});
			}
		});
		return !hasNonZeroData;
	}

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
				['literal', `${data}`]
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
	class="absolute top-2 left-2 z-30 rounded-xl bg-[#ffffff90] p-4 shadow-xl backdrop-blur-sm sm:p-6"
>
	<div class="flex items-start justify-between">
		<div>
			<h1
				class="bg-gradient-to-r bg-clip-text text-lg font-bold tracking-wide text-gray-600 drop-shadow-lg sm:text-3xl"
			>
				W a t a r i d o r i　M a p
			</h1>

			<div class="flex items-center">
				<p class="mt-2 text-sm text-gray-700 opacity-80">渡り鳥観測データの可視化</p>
				<button
					onclick={() => (termsModalOpen = true)}
					class="mt-2 ml-4 rounded-lg bg-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-300"
				>
					利用規約
				</button>
			</div>
		</div>
	</div>
</div>

<!-- データが存在しない期間の表示 -->
{#if isAllZeroData(yearmonth())}
<div
	class="fixed inset-0 z-20 flex items-center justify-center bg-gray-500/30 backdrop-blur-[1px]"
>
	<div class="mx-4 w-full max-w-md overflow-auto rounded-xl bg-white/95 p-4 shadow-2x1 sm:p-6">
		<div class="mb-4 flex items-center justify-center">
			<h2 class="text-xl font-bold text-gray-800 sm:text-2xl">観測状況</h2>
		</div>
		<div class="prose max-w-none text-center text-gray-700">
			<p class="text-sm sm:text-base">この期間は渡り鳥の渡来が終了しています。</p>
		</div>
	</div>
</div>
{/if}

<div
	class="absolute top-28 left-2 z-30 flex flex-col rounded-lg bg-[#ffffff90] p-2 text-xs shadow-lg backdrop-blur-sm sm:top-36 sm:p-4 sm:text-base"
>
	<button
		onclick={() => (selectedOption = 'total')}
		class={`btn btn-primary mr-2 rounded-lg ${selectedOption === 'total' ? 'bg-[#c1c787]' : ''}`}
		disabled={selectedOption === 'total'}
	>
		全種合計
	</button>
	<div class="py-2"></div>
	<div class="flex h-[240px] flex-col gap-1 overflow-auto sm:h-[320px]">
		{#each speciesList as species}
			<button
				onclick={() => (selectedOption = species)}
				class={`btn btn-primary mr-2 rounded-lg ${selectedOption === species ? 'bg-[#c1c787]' : ''}`}
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
	inlineStyle={`height:100dvh;`}
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
				hakutyo: './swanicon2.PNG'
			}}
		>
			<SymbolLayer
				layout={{
					'icon-image': 'hakutyo',
					'icon-size': iconSize(),
					'text-font': ['LINESeedJP_OTF_Bd'],
					'text-field': textField(),
					'icon-allow-overlap': true,
					'text-allow-overlap': true
				}}
				paint={{
					'text-halo-width': 2,
					'text-color': '#44730f',
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
	class="absolute bottom-10 left-1/2 flex w-3/4 min-w-[320px] -translate-x-1/2 transform justify-center rounded-lg bg-[#ffffff90] p-4 backdrop-blur-sm z-30"
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
					本サイトで表示される渡り鳥観測データは、<a
						href="https://www.env.go.jp/nature/dobutsu/bird_flu/migratory/ap_wr_transit/index.html"
						>環境省『渡り鳥の飛来状況調査』</a
					>から取得したデータを加工したものです。月別の集計にあたっては、単月内に複数回の観測が行われている場合はその平均値を用いています。
				</p>

				<h3>2. 免責事項</h3>
				<p>本サイトの情報の正確性、完全性、有用性について一切の保証をいたしません。</p>
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
