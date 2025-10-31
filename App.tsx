import React, { useState, useMemo } from 'react';
import { RAW_CROP_DATA } from './constants';
import { ChartData } from './types';
import SummaryCards from './components/SummaryCards';
import CropList from './components/CropList';
import HarvestChart from './components/HarvestChart';

// Helper function to convert "dd.mm" string to Date object for the current year
const parseDate = (dateStr: string): Date => {
  const [day, month] = dateStr.split('.').map(Number);
  const year = new Date().getFullYear();
  // Month is 0-indexed in JS Dates
  return new Date(year, month - 1, day);
};

// Helper function to get the day of the year (1-366)
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const processData = (): ChartData[] => {
  const colors = [
    '#34d399', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899',
    '#10b981', '#d97706', '#7c3aed', '#dc2626', '#2563eb', '#db2777',
    '#6ee7b7', '#fbbF24', '#a78bfa', '#f87171', '#60a5fa', '#f472b6'
  ];

  return RAW_CROP_DATA.map((crop, index) => {
    const startDateObj = parseDate(crop.startDate);
    const endDateObj = parseDate(crop.endDate);
    
    if (endDateObj < startDateObj) {
        endDateObj.setFullYear(startDateObj.getFullYear() + 1);
    }

    const startDay = getDayOfYear(startDateObj);
    const endDay = getDayOfYear(endDateObj);

    return {
      ...crop,
      startDay,
      harvestDuration: endDay - startDay,
      color: colors[index % colors.length]
    };
  }).sort((a, b) => a.startDay - b.startDay);
};

const App: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  const chartData = useMemo(() => processData(), []);
  
  const totalYield = useMemo(() => 
    chartData.reduce((sum, crop) => sum + crop.yield, 0), 
    [chartData]
  );

  const { earliestStartDate, latestEndDate } = useMemo(() => {
    if (chartData.length === 0) return { earliestStartDate: '', latestEndDate: '' };
    
    let earliest = parseDate(chartData[0].startDate);
    let latest = parseDate(chartData[0].endDate);

    for (const crop of chartData) {
      const start = parseDate(crop.startDate);
      const end = parseDate(crop.endDate);

      if (end < start) end.setFullYear(end.getFullYear() + 1);
      if (start < earliest) earliest = start;
      if (end > latest) latest = end;
    }
    
    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`;
    }

    return {
        earliestStartDate: formatDate(earliest),
        latestEndDate: formatDate(latest)
    };
  }, [chartData]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Панель врожайності культур
            </h1>
            <p className="mt-2 text-lg text-gray-400">
              Візуалізація періодів збору та обсягів
            </p>
        </header>

        <main>
          <SummaryCards 
            totalCrops={chartData.length}
            totalYield={totalYield}
            earliestStartDate={earliestStartDate}
            latestEndDate={latestEndDate}
          />
          
          <div className="mt-8 bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                 <h2 className="text-2xl font-semibold text-white mb-4">Список культур</h2>
                 <CropList 
                    crops={chartData}
                    selectedCrop={selectedCrop}
                    onSelectCrop={setSelectedCrop}
                 />
              </div>
              <div className="lg:col-span-2">
                 <h2 className="text-2xl font-semibold text-white mb-4">Графік збору врожаю</h2>
                 <HarvestChart 
                    data={chartData}
                    selectedCrop={selectedCrop}
                    onSelectCrop={setSelectedCrop}
                 />
              </div>
            </div>
          </div>
        </main>
         <footer className="text-center mt-8 text-gray-400 text-sm">
            <p>Згенеровано за допомогою Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;