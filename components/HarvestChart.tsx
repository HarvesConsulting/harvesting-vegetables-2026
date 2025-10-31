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
        const data = payload[0].payload as ChartData;
        return (
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg text-white">
                <p className="font-bold text-lg">{label}</p>
                <p className="text-sm text-gray-300">
                    Період збору: {data.startDate} - {data.endDate}
                </p>
                <p className="text-sm text-gray-300">
                    Тривалість: {data.harvestDuration} днів
                </p>
                <p className="text-sm text-yellow-400">
                    Валовий збір: {data.yield} т
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
    
    const axisStrokeColor = '#4b5563';
    const tickFillColor = '#d1d5db';
    const cursorFillColor = 'rgba(255, 255, 255, 0.1)';

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
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFillColor }} />
                    <Legend
                        wrapperStyle={{ bottom: 0, left: 25, color: tickFillColor }}
                         payload={[
                             { value: 'Період до збору', type: 'square', color: 'transparent' },
                             { value: 'Період збору', type: 'square', color: '#8b5cf6' }
                         ].map(p => ({...p, color: tickFillColor}))}
                    />
                    <Bar dataKey="startDay" stackId="a" fill="transparent" />
                    <Bar dataKey="harvestDuration" stackId="a" onMouseEnter={(d) => onSelectCrop(d.name)} onMouseLeave={() => onSelectCrop(null)}>
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