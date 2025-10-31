import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { ChartData } from '../types';

interface SingleCropChartProps {
    data: ChartData;
}

// Re-using logic from HarvestChart for consistency
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
const monthNames = ["Чер", "Лип", "Сер", "Вер", "Жов", "Лис"];

const SingleCropChart: React.FC<SingleCropChartProps> = ({ data }) => {
    const adjustedData = [{
        ...data,
        startDay: data.startDay - startDayDomain,
        name: '' // Don't need a Y-axis label here
    }];
    
    const newDomain = [0, endDayDomain - startDayDomain];

    const monthTicks = [];
    for (let i = 5; i <= 10; i++) { // June to November
        monthTicks.push(new Date(year, i, 1));
    }
    const ticksInDaysOfYear = monthTicks.map(dayOfYear);
    const adjustedTicks = ticksInDaysOfYear.map(tick => tick - startDayDomain);

    const tickFormatter = (tick: number) => {
        const date = new Date(year, 0, tick + startDayDomain);
        return monthNames[date.getMonth() - 5];
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={adjustedData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
                <XAxis 
                    type="number" 
                    domain={newDomain} 
                    ticks={adjustedTicks}
                    tickFormatter={tickFormatter}
                    stroke="#4b5563"
                    tick={{ fill: "#d1d5db", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis 
                    type="category" 
                    dataKey="name"
                    tick={false}
                    axisLine={false}
                    width={0}
                />
                <Tooltip cursor={false} />
                <Bar dataKey="startDay" stackId="a" fill="transparent" isAnimationActive={false} />
                <Bar dataKey="harvestDuration" stackId="a" fill={data.color} radius={[10, 10, 10, 10]} isAnimationActive={false}>
                   <LabelList 
                        dataKey="harvestDuration" 
                        position="insideRight" 
                        formatter={(value: number) => `${value} днів`}
                        style={{ fill: 'white', fontWeight: 'bold', fontSize: 12 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SingleCropChart;