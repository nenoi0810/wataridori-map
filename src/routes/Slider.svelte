<script lang="ts">
	let {
		value = $bindable(),
		popupText,
		range
	}: {
		value: number;
		popupText?: string;
		range: [number, number];
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
</script>

<div class="grid w-full grid-cols-1">
	<div class="controls">
		<button class="prev-button" onclick={prev} disabled={value <= range[0]}> ⏮ </button>
		<button class="play-button" onclick={play} disabled={isPlaying}> ▶ </button>
		<button class="pause-button" onclick={pause} disabled={!isPlaying}> ⏸ </button>
		<button class="next-button" onclick={next} disabled={value >= range[1]}> ⏭ </button>
	</div>

	<div class="slider-container" bind:this={sliderContainer}>
		<input type="range" min={range[0]} max={range[1]} bind:value />
		<div class="tooltip">{popupText}</div>
	</div>
</div>

<style>
	.controls {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
		justify-content: center;
	}

	.play-button,
	.pause-button,
	.prev-button,
	.next-button {
		width: 40px;
		height: 40px;
		border: none;
		border-radius: 8px;
		color: black;
		font-size: 16px;
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
		background: #ddd;
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
		width: 20px;
		height: 20px;
		border-radius: 0; /* 四角形にするために border-radius を 0 に */
		background: #4caf50;
		cursor: pointer;
		border: 2px solid #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	/* Firefox */
	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 0; /* 四角形にするために border-radius を 0 に */
		background: #4caf50;
		cursor: pointer;
		border: 2px solid #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	/* Firefox のトラック部分 */
	input[type='range']::-moz-range-track {
		width: 100%;
		height: 6px;
		cursor: pointer;
		background: #ddd;
		border-radius: 3px;
		border: none;
	}

	.tooltip {
		position: absolute;
		top: 30px;
		left: var(--percentage, 0%);
		transform: translateX(-50%);
		background: white;
		color: #333;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		white-space: nowrap;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		transition: left 0.1s ease;
	}

	.tooltip::before {
		content: '';
		position: absolute;
		top: -6px;
		left: 50%;
		transform: translateX(-50%);
		border-left: 6px solid transparent;
		border-right: 6px solid transparent;
		border-bottom: 6px solid white;
	}
</style>
