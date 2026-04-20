import React, { useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import logoImg from '../../assets/nf plantation logo.jpg';
import NFHeader from '../../components/common/NFHeader';
import NFFooter from '../../components/common/NFFooter';
import { Printer, Download, FileText } from 'lucide-react';

const SampleAgreement = () => {
    const { t } = useLanguage();
    const printRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="font-sans text-gray-900 min-h-screen flex flex-col transition-colors duration-300">
            <NFHeader />

            <div className="flex-grow container mx-auto px-4 py-12">

                {/* Header Actions */}
                <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 heading-3d-dark pb-1">
                            <FileText className="text-emerald-600" size={32} />
                            Investment Agreement
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Sample legal agreement for NF Plantation investors.</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="btn-3d-emerald px-8 py-3 flex items-center gap-3"
                    >
                        <Printer size={18} />
                        Print Agreement
                    </button>
                </div>

                {/* Agreement Paper Container */}
                <div
                    ref={printRef}
                    className="max-w-4xl mx-auto bg-white p-12 md:p-16 rounded-xl shadow-xl dark:shadow-none border border-gray-200 print:shadow-none print:border-none print:w-full print:max-w-none"
                >
                    {/* Legal Header */}
                    <div className="text-center mb-12 border-b-2 border-gray-100 pb-8">
                        <div className="mb-6 flex justify-center">
                            <img src={logoImg} alt="NF Plantation" className="w-20 h-20 rounded-full object-cover" />
                        </div>
                        <h2 className="text-2xl font-bold uppercase tracking-wide text-gray-900 mb-2">NF Plantation (Pvt) Ltd</h2>
                        <p className="text-gray-500 text-sm font-medium tracking-widest uppercase">Registration No: PV 00303425</p>
                        <div className="mt-6">
                            <h3 className="text-xl font-bold underline underline-offset-4">INVESTMENT AGREEMENT</h3>
                            <p className="text-sm text-gray-500 mt-2">(Sample Copy)</p>
                        </div>
                    </div>

                    {/* Agreement Body */}
                    <div className="space-y-8 text-gray-800 leading-relaxed text-justify text-sm md:text-base">

                        {/* Intro */}
                        <div>
                            <p className="mb-4">
                                This Agreement is made and entered into on this <strong>[Date]</strong> day of <strong>[Month], [Year]</strong>, at Kilinochchi.
                            </p>
                            <p>
                                <strong>BETWEEN:</strong>
                            </p>
                            <p className="ml-6 my-2">
                                <strong>NF PLANTATION (PVT) LTD</strong> (Reg No. PV 00303425), a company duly incorporated under the laws of Sri Lanka, having its registered office at [Address], hereinafter referred to as the <strong>"First Party"</strong> (which term shall includes its successors and assigns).
                            </p>
                            <p>
                                <strong>AND:</strong>
                            </p>
                            <p className="ml-6 my-2">
                                <strong>[Investor Name]</strong> (NIC No: [NIC Number]), residing at [Address], hereinafter referred to as the <strong>"Second Party"</strong> (which term shall includes their heirs, executors, and administrators).
                            </p>
                        </div>

                        {/* Terms List */}
                        <div className="space-y-6">
                            <h4 className="font-bold border-l-4 border-emerald-500 pl-3">Terms and Conditions:</h4>

                            <ol className="list-decimal pl-5 space-y-4 marker:font-bold marker:text-emerald-600">
                                <li>
                                    <strong>Investment & Returns:</strong> The Second Party hereby invests a sum of <strong>Rs. [Amount]</strong> with the First Party. The First Party agrees to pay a monthly return of <strong>Rs. [Return Amount]</strong> (Calculated at approx. 3-4%) to the bank account of the Second Party.
                                </li>

                                <li>
                                    <strong>Agreement Period:</strong> This agreement is valid for a period of <strong>One (1) Year</strong> from the date of signing.
                                </li>

                                <li>
                                    <strong>Early Termination Policy:</strong> In the event the Second Party wishes to withdraw the investment before the maturity period, the following deductions will apply to the capital/profits:
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <li><strong>0 - 3 Months:</strong> Full amount of profits paid to date will be deducted from the capital refund.</li>
                                        <li><strong>3 - 6 Months:</strong> 75% of profits paid to date will be deducted from the capital refund.</li>
                                        <li><strong>6 - 9 Months:</strong> 50% of profits paid to date will be deducted from the capital refund.</li>
                                        <li><strong>9 - 12 Months:</strong> 25% of profits paid to date will be deducted from the capital refund.</li>
                                    </ul>
                                </li>

                                <li>
                                    <strong>Payment Mode:</strong> Monthly returns will be credited directly to the Second Party's provided bank account.
                                </li>

                                <li>
                                    <strong>Capital Refund:</strong> Upon successful completion of the agreement term, the First Party shall refund the full capital amount to the Second Party, or the agreement may be renewed upon mutual consent.
                                </li>

                                <li>
                                    <strong>Governing Law:</strong> This agreement shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka.
                                </li>
                            </ol>
                        </div>

                        {/* Signatures */}
                        <div className="mt-20 grid grid-cols-2 gap-12 pt-10 border-t border-gray-200">
                            <div className="text-center">
                                <div className="h-20 flex items-end justify-center">
                                    <div className="border-b border-gray-300 w-4/5"></div>
                                </div>
                                <p className="font-bold mt-2">Managing Director</p>
                                <p className="text-xs text-gray-500">NF Plantation (Pvt) Ltd</p>
                                <p className="text-xs text-gray-500">(First Party)</p>
                            </div>
                            <div className="text-center">
                                <div className="h-20 flex items-end justify-center">
                                    <div className="border-b border-gray-300 w-4/5"></div>
                                </div>
                                <p className="font-bold mt-2">Investor Signature</p>
                                <p className="text-xs text-gray-500">[Investor Name]</p>
                                <p className="text-xs text-gray-500">(Second Party)</p>
                            </div>
                        </div>

                        {/* Witnesses */}
                        <div className="mt-12">
                            <p className="font-bold mb-6 underline">Witnesses:</p>
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div>
                                    <p>1. Name: ......................................................</p>
                                    <p className="mt-2">   Sign: .......................................................</p>
                                </div>
                                <div>
                                    <p>2. Name: ......................................................</p>
                                    <p className="mt-2">   Sign: .......................................................</p>
                                </div>
                            </div>
                        </div>

                        {/* Legal Stamp Area */}
                        <div className="mt-16 text-center text-xs text-gray-400">
                            <p>Certified by Attorney-at-Law & Notary Public</p>
                            <div className="mt-4 mx-auto w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                SEAU
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <NFFooter />
        </div>
    );
};

export default SampleAgreement;
