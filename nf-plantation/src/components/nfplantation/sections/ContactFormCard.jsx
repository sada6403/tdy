import React from 'react';
import { Send } from 'lucide-react';

const ContactFormCard = () => {
    return (
        <div className="bg-white dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-8 relative overflow-hidden transition-colors duration-300">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 relative z-10">Send us a Message</h3>
            <form className="space-y-5 relative z-10">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" placeholder="+94 7..." className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea rows="4" placeholder="How can we help you?" className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800 transition-colors resize-none"></textarea>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-500/50">
                    Send Message <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default ContactFormCard;
