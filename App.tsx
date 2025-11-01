import React, { useState, useMemo } from 'react';

// Import components
import SummaryCards from './components/SummaryCards';
import CropList from './components/CropList';
import HarvestChart from './components/HarvestChart';
import CropDetailModal from './components/CropDetailModal';
import CropTable from './components/CropTable';
import MonthFilter from './components/MonthFilter';

// Import data and types
import { RAW_CROP_DATA } from './constants';
import { ChartData } from './types';

// Helper functions for data processing
const year = new Date().getFullYear();

const parseDate = (dateStr: string): Date => {
    const [day, month] = dateStr.split('.').map(Number);
    // Note: month is 0-indexed in JavaScript Date constructor (0 = January)
    return new Date(year, month - 1, day);
};

const dayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Consistent colors for the chart
const COLORS = [
  '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444',
  '#6366F1', '#D946EF', '#22C55E', '#EAB308', '#60A5FA', '#F87171',
  '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#93C5FD', '#FCA5A5',
  '#F472B6', '#14B8A6', '#F97316', '#6D28D9', '#4F46E5', '#BE185D',
  '#059669', '#D97706', '#2563EB', '#DC2626', '#7C3AED', '#DB2777'
];

// Main App component
const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
    const [viewedCropName, setViewedCropName] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    const processedData: ChartData[] = useMemo(() => {
        return RAW_CROP_DATA.map((crop, index) => {
            const startDate = parseDate(crop.startDate);
            const endDate = parseDate(crop.endDate);
            const startDay = dayOfYear(startDate);
            const endDay = dayOfYear(endDate);
            // Duration should be inclusive, so add 1
            const harvestDuration = endDay >= startDay ? endDay - startDay + 1 : 0;

            return {
                ...crop,
                startDay,
                harvestDuration,
                color: COLORS[index % COLORS.length],
            };
        }).sort((a, b) => a.startDay - b.startDay);
    }, []);

    const filteredData = useMemo(() => {
        return processedData.filter(crop => {
            const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (selectedMonth === null) {
                return matchesSearch;
            }

            const startDate = parseDate(crop.startDate);
            const endDate = parseDate(crop.endDate);
            const startMonth = startDate.getMonth();
            const endMonth = endDate.getMonth();
            
            if (startMonth <= endMonth) {
                return matchesSearch && selectedMonth >= startMonth && selectedMonth <= endMonth;
            } else { // Handles cases spanning across year-end, though not in current data
                return matchesSearch && (selectedMonth >= startMonth || selectedMonth <= endMonth);
            }
        });
    }, [processedData, searchTerm, selectedMonth]);

    const alphabeticallySortedFilteredData = useMemo(() => {
        return [...filteredData].sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    }, [filteredData]);

    const dataForTable = useMemo(() => {
        return alphabeticallySortedFilteredData.map(crop => {
            if (selectedMonth === null) {
                return { ...crop, yieldForPeriod: crop.yield };
            }
    
            const monthStartDate = new Date(year, selectedMonth, 1);
            const monthEndDate = new Date(year, selectedMonth + 1, 0);
            
            const cropStartDate = parseDate(crop.startDate);
            const cropEndDate = parseDate(crop.endDate);
    
            const averageYieldPerDay = crop.harvestDuration > 0 ? crop.yield / crop.harvestDuration : 0;
    
            const intersectionStart = new Date(Math.max(cropStartDate.getTime(), monthStartDate.getTime()));
            const intersectionEnd = new Date(Math.min(cropEndDate.getTime(), monthEndDate.getTime()));
    
            let daysInMonth = 0;
            if (intersectionEnd >= intersectionStart) {
                daysInMonth = (intersectionEnd.getTime() - intersectionStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
            }
            
            const yieldForPeriod = averageYieldPerDay * daysInMonth;
    
            return {
                ...crop,
                yieldForPeriod: yieldForPeriod,
            };
        });
    }, [alphabeticallySortedFilteredData, selectedMonth]);

    const viewedCrop = useMemo(() => {
        return viewedCropName ? processedData.find(c => c.name === viewedCropName) : undefined;
    }, [viewedCropName, processedData]);
    
    // Summary data calculation
    const totalCrops = RAW_CROP_DATA.length;
    const totalYield = useMemo(() => RAW_CROP_DATA.reduce((sum, crop) => sum + crop.yield, 0), []);
    
    const { earliestStartDate, latestEndDate } = useMemo(() => {
        if (RAW_CROP_DATA.length === 0) return { earliestStartDate: '', latestEndDate: '' };
        const allStartDates = RAW_CROP_DATA.map(c => parseDate(c.startDate));
        const allEndDates = RAW_CROP_DATA.map(c => parseDate(c.endDate));
        const earliest = new Date(Math.min(...allStartDates.map(d => d.getTime())));
        const latest = new Date(Math.max(...allEndDates.map(d => d.getTime())));
        const formatDate = (date: Date) => `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
        return { earliestStartDate: formatDate(earliest), latestEndDate: formatDate(latest) };
    }, []);


    return (
        <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-center mb-2 text-white">
                        Графік поставок
                    </h1>
                </header>

                <main>
                    <section className="mb-8">
                        <SummaryCards 
                            totalCrops={totalCrops}
                            totalYield={totalYield}
                            earliestStartDate={earliestStartDate}
                            latestEndDate={latestEndDate}
                        />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <aside className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col">
                           <h2 className="text-2xl font-semibold mb-4">Список культур</h2>
                            <CropList
                                crops={alphabeticallySortedFilteredData}
                                selectedCrop={selectedCrop}
                                searchTerm={searchTerm}
                                onSelectCrop={setSelectedCrop}
                                onViewCrop={setViewedCropName}
                                onSearchChange={setSearchTerm}
                            />
                        </aside>
                        
                        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl">
                           <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                               <h2 className="text-2xl font-semibold">Графік збору врожаю</h2>
                               <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setViewMode('chart')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}
                                        aria-pressed={viewMode === 'chart'}
                                    >
                                        Графік
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600'}`}
                                        aria-pressed={viewMode === 'table'}
                                    >
                                        Таблиця
                                    </button>
                               </div>
                           </div>

                            <MonthFilter selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />

                            {viewMode === 'chart' ? (
                                <HarvestChart
                                    data={filteredData}
                                    selectedCrop={selectedCrop}
                                    onSelectCrop={setSelectedCrop}
                                    selectedMonth={selectedMonth}
                                />
                            ) : (
                                <CropTable
                                    crops={dataForTable}
                                    onViewCrop={setViewedCropName}
                                    selectedMonth={selectedMonth}
                                />
                            )}
                        </div>
                    </div>
                </main>

                {viewedCrop && (
                    <CropDetailModal 
                        crop={viewedCrop} 
                        onClose={() => setViewedCropName(null)} 
                    />
                )}
                
                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Дані надано для демонстраційних цілей.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;