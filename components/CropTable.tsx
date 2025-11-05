import React from 'react';
import { ChartData } from '../types';

// Declare the xlsx library from the CDN script to inform TypeScript
declare const XLSX: any;

interface CropTableProps {
    crops: (ChartData & { yieldForPeriod: number })[];
    onViewCrop: (cropName: string) => void;
    selectedMonth: number | null;
}

const CropTable: React.FC<CropTableProps> = ({ crops, onViewCrop, selectedMonth }) => {

    const handleSave = () => {
        // Define headers for the Excel file
        const headers = ["Назва культури", "Початок збору", "Кінець збору", "Тривалість (днів)"];
        if (selectedMonth !== null) {
            headers.push("Збір за період (т)");
        }
        headers.push("Валовий збір (т)");
        
        // Map crop data to an array of arrays for the worksheet
        const dataToExport = crops.map(crop => {
            const row: (string | number)[] = [
                crop.name,
                crop.startDate,
                crop.endDate,
                crop.harvestDuration,
            ];
            if (selectedMonth !== null) {
                // Ensure the value is a number for correct Excel formatting
                row.push(Number(crop.yieldForPeriod.toFixed(1)));
            }
            row.push(crop.yield);
            return row;
        });

        // Create the worksheet from the headers and data
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
        
        // Auto-fit column widths for better presentation
        const columnWidths = headers.map((header, i) => {
            const maxLength = Math.max(
                header.length,
                ...dataToExport.map(row => String(row[i]).length)
            );
            return { wch: maxLength + 2 }; // Add a little padding
        });
        worksheet['!cols'] = columnWidths;

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Дані врожаю");

        // Trigger the file download
        XLSX.writeFile(workbook, "harvest_data.xlsx");
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
                    <span>Зберегти як XLSX</span>
                </button>
            </div>
        </div>
    );
};

export default CropTable;