import React from 'react';

const MONTHS = [
  { name: 'Червень', num: 5 }, // June is month 5 (0-indexed)
  { name: 'Липень', num: 6 },
  { name: 'Серпень', num: 7 },
  { name: 'Вересень', num: 8 },
  { name: 'Жовтень', num: 9 },
  { name: 'Листопад', num: 10 },
];

interface MonthFilterProps {
  selectedMonth: number | null;
  onSelectMonth: (month: number | null) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ selectedMonth, onSelectMonth }) => {
  return (
    <div className="flex justify-center flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelectMonth(null)}
        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${selectedMonth === null ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        aria-pressed={selectedMonth === null}
      >
        Всі місяці
      </button>
      {MONTHS.map(month => (
        <button
          key={month.num}
          onClick={() => onSelectMonth(month.num)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${selectedMonth === month.num ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          aria-pressed={selectedMonth === month.num}
        >
          {month.name}
        </button>
      ))}
    </div>
  );
};

export default MonthFilter;
