import Papa from 'papaparse';

// import csv
import observe012024 from './2024-2025csv/1.csv?raw';
import observe022024 from './2024-2025csv/2.csv?raw';
import observe032024 from './2024-2025csv/3.csv?raw';
import observe042024 from './2024-2025csv/4.csv?raw';
import observe052024 from './2024-2025csv/5.csv?raw';
import observe082024 from './2024-2025csv/8.csv?raw';
import observe092024 from './2024-2025csv/9.csv?raw';
import observe102024 from './2024-2025csv/10.csv?raw';
import observe112024 from './2024-2025csv/11.csv?raw';
import observe122024 from './2024-2025csv/12.csv?raw';
import observe132024 from './2024-2025csv/13.csv?raw';
import observe142024 from './2024-2025csv/14.csv?raw';
import observe152024 from './2024-2025csv/15.csv?raw';
import observe162024 from './2024-2025csv/16.csv?raw';
import observe172024 from './2024-2025csv/17.csv?raw';
import observe182024 from './2024-2025csv/18.csv?raw';
import observe192024 from './2024-2025csv/19.csv?raw';
import observe202024 from './2024-2025csv/20.csv?raw';
import observe212024 from './2024-2025csv/21.csv?raw';
import observe222024 from './2024-2025csv/22.csv?raw';
import observe232024 from './2024-2025csv/23.csv?raw';
import observe242024 from './2024-2025csv/24.csv?raw';
import observe252024 from './2024-2025csv/25.csv?raw';
import observe262024 from './2024-2025csv/26.csv?raw';
import observe272024 from './2024-2025csv/27.csv?raw';
import observe282024 from './2024-2025csv/28.csv?raw';
import observe292024 from './2024-2025csv/29.csv?raw';
import observe302024 from './2024-2025csv/30.csv?raw';
import observe312024 from './2024-2025csv/31.csv?raw';
import observe612024 from './2024-2025csv/61.csv?raw';
import observe622024 from './2024-2025csv/62.csv?raw';
import observe712024 from './2024-2025csv/71.csv?raw';
import observe722024 from './2024-2025csv/72.csv?raw';

// 月別データの型定義
interface MonthlyData {
	[year_month: string]: {
		[species: string]: number;
	};
}

// CSVデータを月別に整形する関数（複数のCSVファイルを統合処理）
function transformToMonthlyData(...csvStrings: string[]): MonthlyData {
	const result: MonthlyData = {};
	const yearMonthCounts: { [yearMonth: string]: number } = {};
	// 各CSVファイルを順次処理
	csvStrings.forEach((csvString) => {
		if (!csvString) return;

		const csvData = Papa.parse(csvString, {
			header: true,
			skipEmptyLines: true
		});

		if (!csvData.data || csvData.data.length === 0) {
			return;
		}

		const rows = csvData.data as any[];
		const headers = Object.keys(rows[0]);

		// 日付の列を抽出（'調査年月日'以外の列）
		// memo: 元データの構造を踏襲しているので「調査年月日」というカラム名だが、本来は「種族名」あたりが正しい
		const dateColumns = headers.filter((header) => header !== '調査年月日' && header.includes('/'));

		dateColumns.forEach((dateCol) => {
			const dateParts = dateCol.split('/');
			if (dateParts.length >= 2) {
				const yearMonth = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}`;
				if (!yearMonthCounts[yearMonth]) {
					yearMonthCounts[yearMonth] = 0;
				}
				yearMonthCounts[yearMonth]++;
			}
		});

		rows.forEach((row: any) => {
			if (!row['調査年月日']) return;

			// 種名から【】部分を除去してクリーンアップ
			const cleanSpeciesName = row['調査年月日'].replace(/\s*【.*?】\s*/, '').trim();

			dateColumns.forEach((dateCol) => {
				const value = row[dateCol];
				if (value && value !== '' && !isNaN(Number(value))) {
					// 日付から年月を抽出（例: "2024/09/03" -> "2024-09"）
					const dateParts = dateCol.split('/');
					if (dateParts.length >= 2) {
						const yearMonth = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}`;

						// 月別データの初期化
						if (!result[yearMonth]) {
							result[yearMonth] = {};
						}

						// 同じ種の複数の観測データがある場合は合計する
						if (result[yearMonth][cleanSpeciesName]) {
							result[yearMonth][cleanSpeciesName] += Number(value);
						} else {
							result[yearMonth][cleanSpeciesName] = Number(value);
						}

						// 月別の全種類のカウントの合計値
						if (!result[yearMonth]['total']) {
							result[yearMonth]['total'] = 0;
						}
						result[yearMonth]['total'] += Number(value);
					}
				}
			});
		});
	});

	// 合計値を観測回数で割って平均値を計算
	Object.keys(result).forEach((yearMonth) => {
		Object.keys(result[yearMonth]).forEach((species) => {
			const totalValue = result[yearMonth][species];
			const count = yearMonthCounts[yearMonth] || 1; // 観測回数が0の場合は1で割る
			result[yearMonth][species] = totalValue / count;
		});
	});

	return result;
}

// 利用可能な鳥の種族リストを取得する関数（複数のCSVファイルから統合）
function getSpeciesList(...csvStrings: string[]): string[] {
	const allSpecies = new Set<string>();

	csvStrings.forEach((csvString) => {
		if (!csvString) return;

		const csvData = Papa.parse(csvString, {
			header: true,
			skipEmptyLines: true
		});

		if (!csvData.data || csvData.data.length === 0) {
			return;
		}

		const rows = csvData.data as any[];
		rows.forEach((row: any) => {
			if (!row['調査年月日']) return;
			// 種名から【】部分を除去してクリーンアップ
			const cleanSpeciesName = row['調査年月日'].replace(/\s*【.*?】\s*/, '').trim();
			if (cleanSpeciesName) {
				allSpecies.add(cleanSpeciesName);
			}
		});
	});

	// ソートして配列として返す
	return Array.from(allSpecies).sort();
}

const observationData = {
	'1': transformToMonthlyData(observe012024),
	'2': transformToMonthlyData(observe022024),
	'3': transformToMonthlyData(observe032024),
	'4': transformToMonthlyData(observe042024),
	'5': transformToMonthlyData(observe052024),
	'8': transformToMonthlyData(observe082024),
	'9': transformToMonthlyData(observe092024),
	'10': transformToMonthlyData(observe102024),
	'11': transformToMonthlyData(observe112024),
	'12': transformToMonthlyData(observe122024),
	'13': transformToMonthlyData(observe132024),
	'14': transformToMonthlyData(observe142024),
	'15': transformToMonthlyData(observe152024),
	'16': transformToMonthlyData(observe162024),
	'17': transformToMonthlyData(observe172024),
	'18': transformToMonthlyData(observe182024),
	'19': transformToMonthlyData(observe192024),
	'20': transformToMonthlyData(observe202024),
	'21': transformToMonthlyData(observe212024),
	'22': transformToMonthlyData(observe222024),
	'23': transformToMonthlyData(observe232024),
	'24': transformToMonthlyData(observe242024),
	'25': transformToMonthlyData(observe252024),
	'26': transformToMonthlyData(observe262024),
	'27': transformToMonthlyData(observe272024),
	'28': transformToMonthlyData(observe282024),
	'29': transformToMonthlyData(observe292024),
	'30': transformToMonthlyData(observe302024),
	'31': transformToMonthlyData(observe312024),
	'61': transformToMonthlyData(observe612024),
	'62': transformToMonthlyData(observe622024),
	'71': transformToMonthlyData(observe712024),
	'72': transformToMonthlyData(observe722024)
};

const speciesList = getSpeciesList(
	observe012024,
	observe022024,
	observe032024,
	observe042024,
	observe052024,
	observe082024,
	observe092024,
	observe102024,
	observe112024,
	observe122024,
	observe132024,
	observe142024,
	observe152024,
	observe162024,
	observe172024,
	observe182024,
	observe192024,
	observe202024,
	observe212024,
	observe222024,
	observe232024,
	observe242024,
	observe252024,
	observe262024,
	observe272024,
	observe282024,
	observe292024,
	observe302024,
	observe312024
);

export { observationData, speciesList };
