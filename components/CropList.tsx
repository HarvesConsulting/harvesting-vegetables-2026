
import React from 'react';
import { ChartData } from '../types';

interface CropListProps {
    crops: ChartData[];
    selectedCrop: string | null;
    onSelectCrop: (cropName: string | null) => void;
}

const CropList: React.FC<CropListProps> = ({ crops, selectedCrop, onSelectCrop }) => {
    return (
        <div className="max-h-[600px] overflow-y-auto pr-2 bg-gray-900 rounded-lg">
            <ul className="space-y-2">
                {crops.map((crop) => (
                    <li 
                        key={crop.name}
                        onMouseEnter={() => onSelectCrop(crop.name)}
                        onMouseLeave={() => onSelectCrop(null)}
                        className={`p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out flex justify-between items-center ${selectedCrop === crop.name ? 'bg-purple-600 shadow-lg scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: crop.color }}></span>
                            <span className="font-medium text-white">{crop.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-300">{crop.yield} т</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CropList;
