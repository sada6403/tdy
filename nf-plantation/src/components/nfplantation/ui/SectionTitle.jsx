import React from 'react';

const SectionTitle = ({ title, subtitle, center = true, light = false }) => {
    return (
        <div className={`mb-12 ${center ? 'text-center' : 'text-left'} max-w-4xl mx-auto relative z-10`}>
            {/* Decorative element */}
            {center && <div className="w-20 h-1 bg-emerald-500 mx-auto mb-6 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
            {!center && <div className="w-20 h-1 bg-emerald-500 mb-6 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}

            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${light ? 'text-white' : 'text-gray-900 dark:text-white'} tracking-tight`}>
                {title.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400" : ""}>{word} </span>
                ))}
            </h2>
            {subtitle && <p className={`text-sm ${light ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} max-w-2xl mx-auto leading-relaxed`}>{subtitle}</p>}
        </div>
    );
};

export default SectionTitle;
