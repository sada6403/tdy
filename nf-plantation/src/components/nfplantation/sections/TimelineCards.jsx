import React from 'react';
import { nfData } from '../../../constants/nfPlantationData';

const TimelineCards = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {nfData.about.timeline.map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-lg relative hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group shadow-sm dark:shadow-none">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors rounded-l-lg"></div>
                    <div className="text-xl font-bold mb-1 text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400">{item.year}</div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">{item.desc}</p>
                </div>
            ))}
        </div>
    );
};

export default TimelineCards;
