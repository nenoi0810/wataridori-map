import Papa from 'papaparse';
import observe02 from './observe02.csv?raw';

// 月別データの型定義
interface MonthlyData {
	[year_month: string]: {
		[species: string]: number;
	};
}

// CSVデータを月別に整形する関数
function transformToMonthlyData(csvString: string): MonthlyData {
	const result: MonthlyData = {};

	const csvData = Papa.parse(csvString, {
		header: true,
		skipEmptyLines: true
	});

	if (!csvData.data || csvData.data.length === 0) {
		return result;
	}

	const rows = csvData.data as any[];
	const headers = Object.keys(rows[0]);

	// 日付の列を抽出（name以外の列）
	const dateColumns = headers.filter((header) => header !== 'name' && header.includes('/'));

	rows.forEach((row: any) => {
		if (!row.name) return;

		// 種名から【】部分を除去してクリーンアップ
		const cleanSpeciesName = row.name.replace(/\s*【.*?】\s*/, '').trim();

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

	return result;
}

// 利用可能な鳥の種族リストを取得する関数
function getSpeciesList(csvString: string): string[] {
	const csvData = Papa.parse(csvString, {
		header: true,
		skipEmptyLines: true
	});

	if (!csvData.data || csvData.data.length === 0) {
		return [];
	}

	const rows = csvData.data as any[];
	const species = rows
		.map((row: any) => {
			if (!row.name) return null;
			// 種名から【】部分を除去してクリーンアップ
			return row.name.replace(/\s*【.*?】\s*/, '').trim();
		})
		.filter((name): name is string => name !== null && name !== '');

	// 重複を除去してソート
	return [...new Set(species)].sort();
}

const observationData = {
	'2': transformToMonthlyData(observe02)
};

const speciesList = getSpeciesList(observe02);

export { observationData, speciesList };
