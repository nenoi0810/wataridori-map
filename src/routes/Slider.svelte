<script lang="ts">
	import { mdiPlay, mdiPause, mdiSkipPrevious, mdiSkipNext } from '@mdi/js';

	let {
		value = $bindable(),
		range,
		formatter
	}: {
		value: number;
		range: [number, number];
		formatter?: (val: number) => string;
	} = $props();

	const INTERVAL = 1000;

	let sliderContainer: HTMLDivElement;
	let isPlaying = $state(false);
	let intervalId: number | null = null;

	$effect(() => {
		if (sliderContainer) {
			const percentage = ((value - range[0]) / (range[1] - range[0])) * 100;
			sliderContainer.style.setProperty('--percentage', `${percentage}%`);
		}
	});

	function play() {
		if (isPlaying) return;
		isPlaying = true;

		// @ts-ignore
		intervalId = setInterval(() => {
			if (value >= range[1]) {
				pause();
				return;
			}
			value = Math.min(value + 1, range[1]);
		}, INTERVAL); // 100ms間隔で値を増加
	}

	function pause() {
		isPlaying = false;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function prev() {
		value = Math.max(value - 1, range[0]);
	}

	function next() {
		value = Math.min(value + 1, range[1]);
	}

	// コンポーネントが破棄される時にintervalをクリア
	$effect(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});

	// 表示する値の範囲を計算
	function getVisibleValues() {
		const visibleCount = 7; // 表示する値の数（現在値 + 左右3つずつ）
		const halfCount = Math.floor(visibleCount / 2);
		const values = [];

		// 範囲を拡張して、スライド効果のために余分な値を含める
		for (let i = -halfCount - 1; i <= halfCount + 1; i++) {
			const val = value + i;
			// 範囲外の値はスキップ
			if (val >= range[0] && val <= range[1]) {
				values.push({
					value: val,
					distance: Math.abs(i),
					position: i
				});
			}
		}

		return values;
	}
</script>

<div class="grid w-full grid-cols-1">
	<div class="controls">
		<button class="prev-button" onclick={prev} disabled={value <= range[0]}>
			<svg viewBox="0 0 24 24" width="36" height="36">
				<path d={mdiSkipPrevious} fill="currentColor" />
			</svg>
		</button>
		{#if !isPlaying}
			<button class="play-button" onclick={play}>
				<svg viewBox="0 0 24 24" width="36" height="36">
					<path d={mdiPlay} fill="currentColor" />
				</svg>
			</button>
		{:else}
			<button class="pause-button" onclick={pause}>
				<svg viewBox="0 0 24 24" width="36" height="36">
					<path d={mdiPause} fill="currentColor" />
				</svg>
			</button>
		{/if}
		<button class="next-button" onclick={next} disabled={value >= range[1]}>
			<svg viewBox="0 0 24 24" width="36" height="36">
				<path d={mdiSkipNext} fill="currentColor" />
			</svg>
		</button>
	</div>

	<div class="value-display">
		<div class="value-slider">
			{#each getVisibleValues() as item (item.value)}
				<span
					class="value-item"
					style="opacity: {item.distance > 3 ? 0 : 1 - item.distance * 0.25}; 
						   font-size: {item.distance === 0 ? '24px' : `${18 - item.distance * 2}px`};
						   font-weight: {item.distance === 0 ? 'bold' : 'normal'};
						   color: {item.distance === 0 ? '#000' : '#666'};
						   transform: translateX({item.position * 100}px) translateX(-50%);"
				>
					{formatter ? formatter(item.value) : item.value}
				</span>
			{/each}
		</div>
	</div>

	<div class="slider-container" bind:this={sliderContainer}>
		<input type="range" min={range[0]} max={range[1]} bind:value />
	</div>
</div>

<style>
	.value-display {
		position: relative;
		height: 40px;
		margin-bottom: 12px;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.value-slider {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.value-item {
		position: absolute;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 50px;
		text-align: center;
		left: 50%;
		top: 50%;
		transform-origin: center;
		white-space: nowrap;
		margin-top: -0.5em;
	}

	.controls {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.play-button,
	.pause-button,
	.prev-button,
	.next-button {
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 8px;
		color: #292929;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.play-button:hover:not(:disabled),
	.pause-button:hover:not(:disabled),
	.prev-button:hover:not(:disabled),
	.next-button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
	}

	.play-button:disabled,
	.pause-button:disabled,
	.prev-button:disabled,
	.next-button:disabled {
		background: #ddd;
		cursor: not-allowed;
		transform: none;
	}

	.slider-container {
		position: relative;
	}

	input[type='range'] {
		-webkit-appearance: none;
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: #b8b8b8;
		outline: none;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	input[type='range']:hover {
		opacity: 1;
	}

	/* WebKit/Safari */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		background: url('/duckicon.PNG') no-repeat center center;
		background-size: contain;
		background-color: white;
		padding: 16px;
		border-radius: 50%;
		/*border: #8f8f8f 2px solid;*/
		border: rgb(75, 68, 68) 2px solid;
		cursor: pointer;
	}

	/* Firefox */
	input[type='range']::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: url('/duckicon.PNG') no-repeat center center;
		background-size: contain;
		cursor: pointer;
		/*border: #8f8f8f 2px solid;*/
		border: rgb(75, 68, 68) 2px solid;
	}

	/* Firefox のトラック部分 */
	input[type='range']::-moz-range-track {
		width: 100%;
		height: 6px;
		cursor: pointer;
		background: #b8b8b8;
		border-radius: 3px;
		border: none;
	}
</style>
