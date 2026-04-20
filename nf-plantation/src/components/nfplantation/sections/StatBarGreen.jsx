import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Users, TrendingUp, Wallet, CheckCircle, Activity, BarChart3 } from 'lucide-react';

const AnimatedCounter = ({ end, suffix = '', prefix = '', duration = 2000, start }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [end, duration, start]);

    return <>{prefix}{count}{suffix}</>;
};

const StatBarGreen = () => {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const stats = [
        {
            icon: Users,
            end: 3000,
            suffix: "+",
            text: null,
            label: t('nfPlantation.home.stats.investors'),
            chart: [40, 60, 55, 80, 70, 90]
        },
        {
            icon: Wallet,
            end: 2,
            suffix: "Cr+",
            text: null,
            label: t('nfPlantation.home.stats.total'),
            chart: [20, 40, 30, 70, 50, 80]
        },
        {
            icon: TrendingUp,
            text: "3-4%",
            label: t('nfPlantation.home.stats.monthly'),
            chart: [40, 50, 60, 70, 80, 90]
        },
        {
            icon: CheckCircle,
            end: 100,
            suffix: "%",
            text: null,
            label: t('nfPlantation.home.stats.success'),
            chart: [98, 99, 98, 99, 100, 100]
        }
    ];

    return (
        <section ref={sectionRef} className="relative py-12 w-full bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
            {/* Tech Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00c85310_1px,transparent_1px),linear-gradient(to_bottom,#00c85310_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent dark:from-gray-900 dark:via-transparent dark:to-transparent transition-colors duration-300"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`group relative bg-white dark:bg-gray-800/40 backdrop-blur-md border border-gray-200 dark:border-[#00c853]/20 hover:border-[#00c853]/60 rounded-xl p-5 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,200,83,0.2)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-[#00c853]/10 rounded-lg group-hover:bg-[#00c853]/20 transition-colors">
                                    <stat.icon size={20} className="text-[#00c853]" />
                                </div>
                                <Activity size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-[#00c853] animate-pulse" />
                            </div>

                            <div className="text-3xl lg:text-4xl font-mono font-bold text-gray-900 dark:text-white mb-1 tracking-tighter group-hover:text-[#00c853] transition-colors">
                                {stat.text ? (
                                    <span>{stat.text}</span>
                                ) : (
                                    <AnimatedCounter end={stat.end} suffix={stat.suffix} start={isVisible} />
                                )}
                            </div>

                            <div className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                                {stat.label}
                            </div>

                            {/* Mini Chart Visualization */}
                            <div className="flex items-end gap-1 h-8 w-full opacity-50 group-hover:opacity-100 transition-opacity">
                                {stat.chart.map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-1 bg-[#00c853]"
                                        style={{
                                            height: `${isVisible ? h : 0}%`,
                                            transition: 'height 1s ease-out',
                                            transitionDelay: `${(i * 100) + (idx * 50)}ms`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            {/* Corner Accents */}
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00c853] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00c853] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatBarGreen;
