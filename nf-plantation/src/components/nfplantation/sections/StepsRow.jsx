import React from 'react';

const StepsRow = () => {
    const steps = [
        { num: 1, title: "Login Account", desc: "Securely log in to manage your investment portfolio" },
        { num: 2, title: "Investment Process", desc: "Apply online easily or visit us directly to start investing" },
        { num: 3, title: "Monthly Returns", desc: "Receive guaranteed monthly returns directly to your account" },
        { num: 4, title: "Principal Return", desc: "Receive your full principal amount back after your chosen term" },
    ];

    return (
        <div className="relative py-12">
            {/* Connecting Line */}
            <div className="absolute top-16 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 hidden md:block -z-10 transform translate-y-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center group">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg mb-6 shadow-md border-4 border-white dark:border-gray-900 relative z-10 transition-colors duration-300">
                            {step.num}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-2 transition-colors">{step.title}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[140px] leading-relaxed transition-colors">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepsRow;
