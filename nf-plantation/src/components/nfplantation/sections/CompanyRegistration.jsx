import React, { useState } from 'react';
import { ShieldCheck, FileText, CalendarDays, Globe, X } from 'lucide-react';

const CompanyRegistration = () => {
  const [showCert, setShowCert] = useState(false);

  return (
    <section className="relative z-10 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-y border-gray-100 dark:border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={24} />
            Company Registration
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Official incorporation details to help customers trust <span className="notranslate" translate="no">NF Plantation</span> and make informed investment decisions.
          </p>
        </div>

        <div className="flex justify-center">
          {/* Details */}
          <div className="bg-gray-50 dark:bg-gray-900/60 p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm max-w-2xl w-full">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Company Name</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white notranslate" translate="no">NF Plantation (PVT) LTD</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Incorporation No.</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">PV 00303425</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="text-emerald-600 dark:text-emerald-400" size={20} />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Date of Incorporation</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">19 June 2024</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="text-emerald-600 dark:text-emerald-400" size={20} />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Jurisdiction</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">Democratic Socialist Republic of Sri Lanka</div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
              Investors should review all terms and understand that returns depend on agricultural performance. Contact us for any verification needs.
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setShowCert(true)}
                className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:underline"
              >
                View Certificate Image
              </button>
              <a href="/company/nf-plantation/contact" className="inline-flex items-center gap-2 text-gray-900 dark:text-white font-bold text-sm hover:underline">
                Contact for Verification
              </a>
            </div>


          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCert(false)}>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-2 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 absolute top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
              <h3 className="font-bold text-lg">Company Registration</h3>
              <button
                onClick={() => setShowCert(false)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-1 mt-16 overflow-y-auto max-h-[calc(90vh-80px)] bg-gray-100 dark:bg-gray-950 rounded-xl">
              <img src="/images/certificate.png" alt="Company Registration Certificate" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompanyRegistration;