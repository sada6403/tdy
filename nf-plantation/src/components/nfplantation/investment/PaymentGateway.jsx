import React, { useState } from 'react';
import { CreditCard, ArrowLeft, Shield, Lock, Smartphone } from 'lucide-react';

const PaymentGateway = ({ amount, onSuccess, onCancel }) => {
    const [gatewayStep, setGatewayStep] = useState('METHODS'); // METHODS, INPUT, OTP
    const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiryMM: '', expiryYY: '', cvv: '' });
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInput = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };

    const handlePayClick = () => {
        if (!cardDetails.number || !cardDetails.cvv) return;
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setGatewayStep('OTP');
        }, 1500);
    };

    const handleOtpConfirm = () => {
        if (otp.length < 4) return;
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess(); // Trigger parent success
        }, 2000);
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 font-sans relative z-50">
            {/* Red Header */}
            <div className="bg-[#E60000] p-6 text-white relative">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#E60000] font-bold shadow-md">
                        NF
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">NF Plantation Pay</h3>
                        <p className="text-xs text-white/80">Secure Investment Gateway</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-white/80 mb-1">Total Amount</p>
                    <h2 className="text-3xl font-bold">LKR {Number(amount).toLocaleString()}</h2>
                </div>
                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Lock size={12} /> Secured by PayHere
                </div>
            </div>

            {/* Body Content */}
            <div className="p-6 min-h-[400px] bg-gray-50/50">

                {/* 1. Method Selection */}
                {gatewayStep === 'METHODS' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
                            Pay with
                        </div>

                        <div className="space-y-4">
                            {/* Bank Card Option */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#E60000] cursor-pointer transition-all group" onClick={() => setGatewayStep('INPUT')}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#E60000]">Bank Card</span>
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-5 bg-blue-600 rounded text-[8px] text-white flex items-center justify-center font-bold italic">VISA</div>
                                        <div className="w-8 h-5 bg-orange-500 rounded text-[8px] text-white flex items-center justify-center font-bold italic">MC</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-[#E60000]/10 group-hover:text-[#E60000]">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Pay with Visa / Master</p>
                                        <p className="text-xs text-gray-400">Secure credit/debit card payment</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Account Option (Mock) */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm opacity-60 cursor-not-allowed">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-500">Bank Account</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-500">Direct Debit</p>
                                        <p className="text-xs text-gray-400">Not available for this plan</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 font-bold">
                                Cancel Payment
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Card Input */}
                {gatewayStep === 'INPUT' && (
                    <div className="animate-in fade-in slide-in-from-right-8">
                        <button onClick={() => setGatewayStep('METHODS')} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                            <ArrowLeft size={16} /> Bank Card
                        </button>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Card Holder's Name</label>
                                <input
                                    name="name"
                                    value={cardDetails.name}
                                    onChange={handleInput}
                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-[#E60000]/20"
                                    placeholder="Name on card"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Card Number</label>
                                <input
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleInput}
                                    maxLength={19}
                                    className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-[#E60000]/20 font-mono"
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">Expiry</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="expiryMM"
                                            value={cardDetails.expiryMM}
                                            onChange={handleInput}
                                            maxLength={2}
                                            className="w-full bg-gray-100 border-none rounded-xl px-2 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-[#E60000]/20 text-center"
                                            placeholder="MM"
                                        />
                                        <input
                                            name="expiryYY"
                                            value={cardDetails.expiryYY}
                                            onChange={handleInput}
                                            maxLength={2}
                                            className="w-full bg-gray-100 border-none rounded-xl px-2 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-[#E60000]/20 text-center"
                                            placeholder="YY"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-1 block">CVV</label>
                                    <input
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleInput}
                                        maxLength={3}
                                        className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 font-bold text-gray-800 focus:ring-2 focus:ring-[#E60000]/20 text-center"
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePayClick}
                            disabled={isProcessing || !cardDetails.number}
                            className="w-full mt-8 py-4 bg-[#FFB800] hover:bg-[#E5A600] text-black font-extrabold rounded-xl shadow-lg shadow-orange-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                `Pay LKR ${Number(amount).toLocaleString()}`
                            )}
                        </button>
                    </div>
                )}

                {/* 3. OTP Secure */}
                {gatewayStep === 'OTP' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                            <div className="text-[#E60000] font-serif font-black italic text-xl">BOC</div>
                            <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 italic rounded">VISA SECURE</div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-[#004A8F] font-bold text-lg mb-1">Purchase Authentication</h3>
                            <p className="text-xs text-gray-500">
                                We have sent a text message with OTP code to your registered mobile number ending with <b>xxxx-xx-889</b>.
                            </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
                            <label className="text-xs font-bold text-gray-500 block mb-2">Enter OTP Code</label>
                            <div className="relative">
                                <input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-bold text-lg tracking-widest text-center focus:ring-2 focus:ring-[#004A8F] focus:border-[#004A8F] outline-none"
                                    placeholder="000000"
                                />
                                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleOtpConfirm}
                                disabled={isProcessing}
                                className="w-full py-3 bg-[#0085CA] hover:bg-[#0073B0] text-white font-bold rounded-lg shadow-sm transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Verifying...' : 'CONFIRM'}
                            </button>
                            <button className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-sm transition-all">
                                RESEND
                            </button>
                            <button onClick={() => setGatewayStep('INPUT')} className="w-full py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded-lg shadow-sm transition-all">
                                CANCEL
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-gray-400">PayHere is a Central Bank approved Secure Payment Gateway Service</p>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer shadow */}
            <div className="h-2 bg-gradient-to-t from-gray-200 to-transparent"></div>
        </div>
    );
};

export default PaymentGateway;
