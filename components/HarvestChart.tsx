import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { ChartData } from '../types';

interface HarvestChartProps {
    data: ChartData[];
    selectedCrop: string | null;
    onSelectCrop: (cropName: string | null) => void;
    selectedMonth: number | null;
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

const year = new Date().getFullYear();
const dayOfYear = (date: Date): number => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const HarvestChart: React.FC<HarvestChartProps> = ({ data, selectedCrop, onSelectCrop, selectedMonth }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const { domainStartDate, domainEndDate, monthTicks } = useMemo(() => {
        if (selectedMonth !== null) {
            const startDate = new Date(year, selectedMonth, 1);
            const endDate = new Date(year, selectedMonth + 1, 0); // Last day of month
            const ticks = [];
            const daysInMonth = endDate.getDate();

            ticks.push(new Date(year, selectedMonth, 1));
            if (daysInMonth > 10) ticks.push(new Date(year, selectedMonth, 10));
            if (daysInMonth > 20) ticks.push(new Date(year, selectedMonth, 20));
            ticks.push(new Date(year, selectedMonth, daysInMonth));
            
            // remove duplicates if e.g. month has 20 days
            const uniqueTicks = ticks.filter((t, i, self) => self.findIndex(d => d.getDate() === t.getDate()) === i);

            return { domainStartDate: startDate, domainEndDate: endDate, monthTicks: uniqueTicks };
        } else {
            const startDate = new Date(year, 5, 1); // June 1st
            const endDate = new Date(year, 10, 15); // November 15th
            const ticks = [];
            for (let i = 5; i <= 10; i++) {
                ticks.push(new Date(year, i, 1));
            }
            return { domainStartDate: startDate, domainEndDate: endDate, monthTicks: ticks };
        }
    }, [selectedMonth]);

    const startDayDomain = dayOfYear(domainStartDate);
    const endDayDomain = dayOfYear(domainEndDate);

    const adjustedData = useMemo(() => data.map(d => {
        const cropStartDay = d.startDay;
        const cropEndDay = d.startDay + d.harvestDuration - 1;

        const visibleStartDay = Math.max(cropStartDay, startDayDomain);
        const visibleEndDay = Math.min(cropEndDay, endDayDomain);

        if (visibleStartDay > visibleEndDay) {
            return { ...d, visibleStartOffset: 0, visibleDuration: 0 };
        }
        
        const newStartDay = visibleStartDay - startDayDomain;
        const newHarvestDuration = visibleEndDay - visibleStartDay + 1;

        return { ...d, visibleStartOffset: newStartDay, visibleDuration: newHarvestDuration };
    }), [data, startDayDomain, endDayDomain]);

    const newDomain = [0, endDayDomain - startDayDomain];

    const ticksInDaysOfYear = monthTicks.map(dayOfYear);
    const adjustedTicks = ticksInDaysOfYear.map(tick => tick - startDayDomain);

    const tickFormatter = (tick: number) => {
        const originalDayOfYear = Math.round(tick) + startDayDomain;
        const date = new Date(year, 0, originalDayOfYear);
        
        if (selectedMonth !== null) {
            return String(date.getDate());
        }
        
        const allMonthNames = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
        return allMonthNames[date.getMonth()];
    };

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
                        allowDataOverflow={true}
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
                    <Legend
                        wrapperStyle={{ bottom: 0, left: 25, color: tickFillColor }}
                    />
                    <Bar dataKey="visibleStartOffset" stackId="a" fill="transparent" name="Період до збору" />
                    <Bar dataKey="visibleDuration" stackId="a" fill="#8b5cf6" name="Період збору" onMouseEnter={(d) => onSelectCrop(d.name)} onMouseLeave={() => onSelectCrop(null)}>
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