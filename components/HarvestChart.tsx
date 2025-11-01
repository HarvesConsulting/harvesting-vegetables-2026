import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { ChartData } from '../types';

interface HarvestChartProps {
    data: ChartData[];
    selectedCrop: string | null;
    onSelectCrop: (cropName: string | null) => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Find the original full name from the payload
        const originalData = payload[0].payload as ChartData;
        const fullLabel = originalData.name;

        return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg text-white">
                <p className="font-bold text-lg">{fullLabel}</p>
                <p className="text-sm text-gray-300">
                    Період збору: {originalData.startDate} - {originalData.endDate}
                </p>
                <p className="text-sm text-gray-300">
                    Тривалість: {originalData.harvestDuration} днів
                </p>
                <p className="text-sm text-yellow-400">
                    Валовий збір: {originalData.yield} т
                </p>
            </div>
        );
    }
    return null;
};

const HarvestChart: React.FC<HarvestChartProps> = ({ data, selectedCrop, onSelectCrop }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const formatYAxisTick = (tick: string) => {
        const maxLength = isMobile ? 12 : 18;
        if (tick.length > maxLength) {
            return `${tick.substring(0, maxLength - 3)}...`;
        }
        return tick;
    };
    
    const axisStrokeColor = '#4b5563';
    const tickFillColor = '#d1d5db';
    const cursorFillColor = 'rgba(139, 92, 246, 0.2)'; // More subtle, theme-aligned cursor

    const monthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
    const year = new Date().getFullYear();

    const dayOfYear = (date: Date): number => {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    const domainStartDate = new Date(year, 5, 1); // June 1st
    const domainEndDate = new Date(year, 10, 15); // November 15th
    
    const startDayDomain = dayOfYear(domainStartDate); 
    const endDayDomain = dayOfYear(domainEndDate);

    const adjustedData = data.map(d => ({
        ...d,
        startDay: d.startDay - startDayDomain,
    }));

    const newDomain = [0, endDayDomain - startDayDomain];

    const monthTicks = [];
    for (let i = 5; i <= 10; i++) {
        monthTicks.push(new Date(year, i, 1));
    }
    const ticksInDaysOfYear = monthTicks.map(dayOfYear);
    const adjustedTicks = ticksInDaysOfYear.map(tick => tick - startDayDomain);

    const tickFormatter = (tick: number) => {
        const originalDayOfYear = tick + startDayDomain;
        const date = new Date(year, 0, originalDayOfYear);
        return monthNames[date.getMonth()];
    };

    return (
        <div className="w-full h-[600px]">
            <ResponsiveContainer>
                <BarChart
                    data={adjustedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: isMobile ? 5 : 20, bottom: 20 }}
                    barCategoryGap="20%"
                >
                    <XAxis 
                        type="number" 
                        domain={newDomain} 
                        ticks={adjustedTicks}
                        tickFormatter={tickFormatter}
                        stroke={axisStrokeColor}
                        tick={{ fill: tickFillColor, fontSize: 12 }}
                    />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke={axisStrokeColor}
                        tick={{ fill: tickFillColor, fontSize: isMobile ? 10 : 12 }}
                        width={isMobile ? 100 : 120}
                        interval={0}
                        tickFormatter={formatYAxisTick}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFillColor }} />
                    {/* FIX: Replaced custom legend payload with automatic legend generation from Bar components to fix TypeScript error. */}
                    <Legend
                        wrapperStyle={{ bottom: 0, left: 25, color: tickFillColor }}
                    />
                    <Bar dataKey="startDay" stackId="a" fill="transparent" name="Період до збору" />
                    <Bar dataKey="harvestDuration" stackId="a" fill="#8b5cf6" name="Період збору" onMouseEnter={(d) => onSelectCrop(d.name)} onMouseLeave={() => onSelectCrop(null)}>
                        {adjustedData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color} 
                                opacity={selectedCrop === null || selectedCrop === entry.name ? 1 : 0.3}
                                className="transition-opacity duration-300 ease-in-out"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HarvestChart;