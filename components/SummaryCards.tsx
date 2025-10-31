import React from 'react';

interface SummaryCardsProps {
    totalCrops: number;
    totalYield: number;
    earliestStartDate: string;
    latestEndDate: string;
}

const StatCard: React.FC<{ title: string; value: string; description: string; icon: React.ReactElement }> = ({ title, value, description, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    </div>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalCrops, totalYield, earliestStartDate, latestEndDate }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Всього культур"
                value={totalCrops.toString()}
                description="Загальна кількість унікальних культур"
                icon={<LeafIcon className="w-6 h-6 text-green-400" />}
            />
            <StatCard 
                title="Загальний валовий збір"
                value={`${totalYield.toLocaleString('uk-UA')} т`}
                description="Сумарний обсяг врожаю з усіх культур"
                icon={<ScaleIcon className="w-6 h-6 text-yellow-400" />}
            />
            <StatCard 
                title="Період поставок"
                value={`${earliestStartDate} - ${latestEndDate}`}
                description="Загальний сезон збору врожаю"
                icon={<CalendarIcon className="w-6 h-6 text-purple-400" />}
            />
        </div>
    );
};

// SVG Icons
const LeafIcon: React.FC<{className: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ScaleIcon: React.FC<{className: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l-6-2m0 0l-3 9m12-9l-3 9m0 0l-3-1m-6-3l-3 1m0 0l6 10M9 7l6 10" />
    </svg>
);

const CalendarIcon: React.FC<{className: string}> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default SummaryCards;