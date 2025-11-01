import React from 'react';
import { ChartData } from '../types';

interface CropTableProps {
    crops: (ChartData & { yieldForPeriod: number })[];
    onViewCrop: (cropName: string) => void;
    selectedMonth: number | null;
}

const CropTable: React.FC<CropTableProps> = ({ crops, onViewCrop, selectedMonth }) => {

    const handleSave = () => {
        const headers = ["Назва культури", "Початок збору", "Кінець збору", "Тривалість (днів)"];
        if (selectedMonth !== null) {
            headers.push("Збір за період, т");
        }
        headers.push("Валовий збір (т)");
        
        const dataRows: string[][] = crops.map(crop => {
            const row = [
                String(crop.name),
                String(crop.startDate),
                String(crop.endDate),
                String(crop.harvestDuration),
            ];
            if (selectedMonth !== null) {
                row.push(String(crop.yieldForPeriod.toFixed(1)));
            }
            row.push(String(crop.yield));
            return row;
        });

        const allRowsForSizing = [headers, ...dataRows];

        // Calculate the maximum width for each column
        const columnWidths = headers.map((_, colIndex) => 
            Math.max(...allRowsForSizing.map(row => row[colIndex].length))
        );

        // Function to create a formatted row with padding
        const createFormattedRow = (row: string[]): string => {
            return row.map((cell, index) => cell.padEnd(columnWidths[index], ' '))
                      .join(' | ');
        };
        
        // Create the header row
        const formattedHeader = createFormattedRow(headers);

        // Create a separator line
        const separator = columnWidths.map(width => '-'.repeat(width)).join('-|-');
        
        // Create formatted data rows
        const formattedDataRows = dataRows.map(createFormattedRow);

        // Combine everything into the final text content
        const txtContent = [
            formattedHeader,
            separator,
            ...formattedDataRows
        ].join('\n');

        // Add BOM for correct encoding of Cyrillic characters in some text editors
        const blob = new Blob(['\uFEFF' + txtContent], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "harvest_data.txt");
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div>
            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full bg-gray-800 text-white">
                    <thead>
                        <tr className="bg-gray-700 text-left">
                            <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider">Назва культури</th>
                            <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider">Початок збору</th>
                            <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider">Кінець збору</th>
                            <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider text-right">Тривалість (днів)</th>
                            {selectedMonth !== null && (
                                <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider text-right">Збір за період, т</th>
                            )}
                            <th className="py-3 px-4 text-sm font-semibold uppercase tracking-wider text-right">Валовий збір (т)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {crops.map((crop) => (
                            <tr 
                                key={crop.name} 
                                onClick={() => onViewCrop(crop.name)} 
                                className="hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && onViewCrop(crop.name)}
                                aria-label={`View details for ${crop.name}`}
                            >
                                <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span 
                                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0" 
                                            style={{ backgroundColor: crop.color }}
                                            aria-hidden="true"
                                        ></span>
                                        <span>{crop.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">{crop.startDate}</td>
                                <td className="py-3 px-4 whitespace-nowrap">{crop.endDate}</td>
                                <td className="py-3 px-4 whitespace-nowrap text-right">{crop.harvestDuration}</td>
                                {selectedMonth !== null && (
                                    <td className="py-3 px-4 whitespace-nowrap text-right">{crop.yieldForPeriod.toFixed(1)}</td>
                                )}
                                <td className="py-3 px-4 whitespace-nowrap text-right font-semibold">{crop.yield}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Зберегти таблицю</span>
                </button>
            </div>
        </div>
    );
};

export default CropTable;