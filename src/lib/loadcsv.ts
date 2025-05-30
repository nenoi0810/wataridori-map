import Papa from 'papaparse';

// import csv
// 2024-2025
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
import observe322024 from './2024-2025csv/32.csv?raw';
import observe342024 from './2024-2025csv/34.csv?raw';
import observe352024 from './2024-2025csv/35.csv?raw';
import observe362024 from './2024-2025csv/36.csv?raw';
import observe372024 from './2024-2025csv/37.csv?raw';
import observe382024 from './2024-2025csv/38.csv?raw';
import observe392024 from './2024-2025csv/39.csv?raw';
import observe402024 from './2024-2025csv/40.csv?raw';
import observe412024 from './2024-2025csv/41.csv?raw';
import observe422024 from './2024-2025csv/42.csv?raw';
import observe432024 from './2024-2025csv/43.csv?raw';
import observe442024 from './2024-2025csv/44.csv?raw';
import observe452024 from './2024-2025csv/45.csv?raw';
import observe462024 from './2024-2025csv/46.csv?raw';
import observe472024 from './2024-2025csv/47.csv?raw';
import observe482024 from './2024-2025csv/48.csv?raw';
import observe492024 from './2024-2025csv/49.csv?raw';
import observe502024 from './2024-2025csv/50.csv?raw';
import observe512024 from './2024-2025csv/51.csv?raw';
import observe522024 from './2024-2025csv/52.csv?raw';
import observe612024 from './2024-2025csv/61.csv?raw';
import observe622024 from './2024-2025csv/62.csv?raw';
import observe712024 from './2024-2025csv/71.csv?raw';
import observe722024 from './2024-2025csv/72.csv?raw';
// 2023-2024
import observe012023 from './2023-2024csv/1.csv?raw';
import observe022023 from './2023-2024csv/2.csv?raw';
import observe032023 from './2023-2024csv/3.csv?raw';
import observe042023 from './2023-2024csv/4.csv?raw';
import observe052023 from './2023-2024csv/5.csv?raw';
import observe082023 from './2023-2024csv/8.csv?raw';
import observe092023 from './2023-2024csv/9.csv?raw';
import observe102023 from './2023-2024csv/10.csv?raw';
import observe112023 from './2023-2024csv/11.csv?raw';
import observe122023 from './2023-2024csv/12.csv?raw';
import observe132023 from './2023-2024csv/13.csv?raw';
import observe142023 from './2023-2024csv/14.csv?raw';
import observe152023 from './2023-2024csv/15.csv?raw';
import observe162023 from './2023-2024csv/16.csv?raw';
import observe172023 from './2023-2024csv/17.csv?raw';
import observe182023 from './2023-2024csv/18.csv?raw';
import observe192023 from './2023-2024csv/19.csv?raw';
import observe202023 from './2023-2024csv/20.csv?raw';
import observe212023 from './2023-2024csv/21.csv?raw';
import observe222023 from './2023-2024csv/22.csv?raw';
import observe232023 from './2023-2024csv/23.csv?raw';
import observe612023 from './2023-2024csv/61.csv?raw';
import observe622023 from './2023-2024csv/62.csv?raw';
import observe712023 from './2023-2024csv/71.csv?raw';
import observe722023 from './2023-2024csv/72.csv?raw';

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
			// roundup
			result[yearMonth][species] = Math.round((totalValue / count) * 10) / 10;
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
	'1': transformToMonthlyData(observe012024, observe012023),
	'2': transformToMonthlyData(observe022024, observe022023),
	'3': transformToMonthlyData(observe032024, observe032023),
	'4': transformToMonthlyData(observe042024, observe042023),
	'5': transformToMonthlyData(observe052024, observe052023),
	'8': transformToMonthlyData(observe082024, observe082023),
	'9': transformToMonthlyData(observe092024, observe092023),
	'10': transformToMonthlyData(observe102024, observe102023),
	'11': transformToMonthlyData(observe112024, observe112023),
	'12': transformToMonthlyData(observe122024, observe122023),
	'13': transformToMonthlyData(observe132024, observe132023),
	'14': transformToMonthlyData(observe142024, observe142023),
	'15': transformToMonthlyData(observe152024, observe152023),
	'16': transformToMonthlyData(observe162024, observe162023),
	'17': transformToMonthlyData(observe172024, observe172023),
	'18': transformToMonthlyData(observe182024, observe182023),
	'19': transformToMonthlyData(observe192024, observe192023),
	'20': transformToMonthlyData(observe202024, observe202023),
	'21': transformToMonthlyData(observe212024, observe212023),
	'22': transformToMonthlyData(observe222024, observe222023),
	'23': transformToMonthlyData(observe232024, observe232023),
	'24': transformToMonthlyData(observe242024),
	'25': transformToMonthlyData(observe252024),
	'26': transformToMonthlyData(observe262024),
	'27': transformToMonthlyData(observe272024),
	'28': transformToMonthlyData(observe282024),
	'29': transformToMonthlyData(observe292024),
	'30': transformToMonthlyData(observe302024),
	'31': transformToMonthlyData(observe312024),
	'32': transformToMonthlyData(observe322024),
	'34': transformToMonthlyData(observe342024),
	'35': transformToMonthlyData(observe352024),
	'36': transformToMonthlyData(observe362024),
	'37': transformToMonthlyData(observe372024),
	'38': transformToMonthlyData(observe382024),
	'39': transformToMonthlyData(observe392024),
	'40': transformToMonthlyData(observe402024),
	'41': transformToMonthlyData(observe412024),
	'42': transformToMonthlyData(observe422024),
	'43': transformToMonthlyData(observe432024),
	'44': transformToMonthlyData(observe442024),
	'45': transformToMonthlyData(observe452024),
	'46': transformToMonthlyData(observe462024),
	'47': transformToMonthlyData(observe472024),
	'48': transformToMonthlyData(observe482024),
	'49': transformToMonthlyData(observe492024),
	'50': transformToMonthlyData(observe502024),
	'51': transformToMonthlyData(observe512024),
	'52': transformToMonthlyData(observe522024),
	'61': transformToMonthlyData(observe612024, observe612023),
	'62': transformToMonthlyData(observe622024, observe622023),
	'71': transformToMonthlyData(observe712024, observe712023),
	'72': transformToMonthlyData(observe722024, observe722023)
};

const speciesList = getSpeciesList(
	// 2024-2025
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
	observe312024,
	observe322024,
	observe342024,
	observe352024,
	observe362024,
	observe372024,
	observe382024,
	observe392024,
	observe402024,
	observe412024,
	observe422024,
	observe432024,
	observe442024,
	observe452024,
	observe462024,
	observe472024,
	observe482024,
	observe492024,
	observe502024,
	observe512024,
	observe522024,
	observe612024,
	observe622024,
	observe712024,
	observe722024,
	// 2023-2024
	observe012023,
	observe022023,
	observe032023,
	observe042023,
	observe052023,
	observe082023,
	observe092023,
	observe102023,
	observe112023,
	observe122023,
	observe132023,
	observe142023,
	observe152023,
	observe162023,
	observe172023,
	observe182023,
	observe192023,
	observe202023,
	observe212023,
	observe222023,
	observe232023,
	observe612023,
	observe622023,
	observe712023,
	observe722023
);

export { observationData, speciesList };
