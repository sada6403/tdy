import React from 'react';

const FeatureCard = ({ icon: Icon, title, desc, center = true }) => {
    return (
        <div className={`bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 transition-all duration-300 ${center ? 'text-center' : ''} h-full group`}>
            <div className={`w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300 ${center ? 'mx-auto' : ''}`}>
                <Icon size={24} strokeWidth={1.5} className="group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-3 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{desc}</p>
        </div>
    );
};

export default FeatureCard;
