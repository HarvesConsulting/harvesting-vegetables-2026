import React from 'react';
import { ChartData } from '../types';

interface CropListProps {
    crops: ChartData[];
    selectedCrop: string | null;
    searchTerm: string;
    onSelectCrop: (cropName: string | null) => void;
    onViewCrop: (cropName: string) => void;
    onSearchChange: (term: string) => void;
}

const CropList: React.FC<CropListProps> = ({ crops, selectedCrop, searchTerm, onSelectCrop, onViewCrop, onSearchChange }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Пошук культури..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Пошук культури"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
            <div className="flex-grow max-h-[540px] overflow-y-auto pr-2 bg-gray-900 rounded-lg">
                {crops.length > 0 ? (
                    <ul className="space-y-2">
                        {crops.map((crop) => (
                            <li 
                                key={crop.name}
                                onMouseEnter={() => onSelectCrop(crop.name)}
                                onMouseLeave={() => onSelectCrop(null)}
                                onClick={() => onViewCrop(crop.name)}
                                className={`p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out flex justify-between items-center ${selectedCrop === crop.name ? 'bg-purple-600 shadow-lg scale-105 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: crop.color }}></span>
                                    <span className={`font-medium ${selectedCrop === crop.name ? 'text-white' : 'text-white'}`}>{crop.name}</span>
                                </div>
                                <span className={`text-sm font-semibold ${selectedCrop === crop.name ? 'text-gray-200' : 'text-gray-300'}`}>{crop.yield} т</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>Не знайдено культур, що відповідають вашому запиту.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CropList;