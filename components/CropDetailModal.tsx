import React from 'react';
import { ChartData } from '../types';
import SingleCropChart from './SingleCropChart';

interface CropDetailModalProps {
  crop: ChartData;
  onClose: () => void;
}

const CropDetailModal: React.FC<CropDetailModalProps> = ({ crop, onClose }) => {
  const tonsPerWeek = crop.harvestDuration > 0 ? (crop.yield / crop.harvestDuration) * 7 : 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-3xl text-white relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-3xl font-bold mb-2">{crop.name}</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-gray-300 mb-6">
            <p><strong>Період збору:</strong> {crop.startDate} - {crop.endDate}</p>
            <p><strong>Валовий збір:</strong> {crop.yield} т</p>
            <p><strong>Середній збір:</strong> {tonsPerWeek.toFixed(1)} т/тиждень</p>
        </div>
        <div className="h-48 w-full">
          <SingleCropChart data={crop} />
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default CropDetailModal;