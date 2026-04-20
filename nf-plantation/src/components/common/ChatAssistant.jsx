import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { nfData } from '../../constants/nfPlantationData';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: "Hello! Welcome to NF Plantation. \n\nI can speak **English**, **Tamil**, and **Sinhala**. \n\nHow can I help you today? \n(என்னிடம் கேள்விகளை கேளுங்கள் / මගෙන් ප්‍රශ්න අසන්න)" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // --- NLP & Fuzzy Matching Logic ---

    // 1. Calculate Levenshtein Distance (for typo tolerance)
    const getSimilarity = (s1, s2) => {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    };

    const editDistance = (s1, s2) => {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        const costs = new Array();
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };

    // 2. Knowledge Base (Intents & Keywords in 3 Languages)
    const intents = {
        greeting: {
            keywords: [
                'hi', 'hello', 'hey', 'morning', 'evening', // EN
                'vanakkam', 'vannakkam', 'nalam', 'vaazhga', // TA (Transliterated)
                'வணக்கம்', 'ஹலோ', // TA (Script)
                'ayubowan', 'kohomada', 'suba', // SI (Transliterated)
                'ආයුබෝවන්', 'කොහොමද' // SI (Script)
            ],
            answers: {
                en: "Hello! Welcome to NF Plantation Support. How can I assist you with our investment opportunities today?",
                ta: "வணக்கம்! NF Plantation உதவி மையத்திற்கு வரவேற்கிறோம். இன்று எமது முதலீட்டு வாய்ப்புகள் பற்றி நான் எவ்வாறு உதவ முடியும்?",
                si: "ආයුබෝවන්! NF Plantation සහාය මධ්‍යස්ථානයට සාදරයෙන් පිළිගනිමු. අද අපගේ ආයෝජන අවස්ථාවන් පිළිබඳව මට ඔබට සහාය විය හැක්කේ කෙසේද?"
            }
        },
        founder: {
            keywords: [
                'founder', 'ceo', 'owner', 'boss', 'kunatheepan', 'who started', 'head', // EN
                'niruvanar', 'thalaivar', 'yar', 'owner', 'kunatheepan', // TA
                'நிறுவனர்', 'தலைவர்', 'யார்', 'குணதீபன்', // TA
                'nirmaatru', 'ayithi', 'kunatheepan', 'kawuda', // SI
                'නිර්මාතෘ', 'අයිතිකරු', 'කවුද', 'කුණතීපන්' // SI
            ],
            answers: {
                en: "NF Plantation was founded by **Mr. Thiyagarajaj Kunatheepan** (CEO). He established the company in 2020 with a vision for sustainable community growth.",
                ta: "NF Plantation **திரு. தியாகராஜா குணதீபன்** (CEO) அவர்களால் நிறுவப்பட்டது. அவர் 2020 ஆம் ஆண்டில் நிலையான சமூக வளர்ச்சிக்காக இந்த நிறுவனத்தை தொடங்கினார்.",
                si: "NF Plantation ආරම්භ කරන ලද්දේ **ත්‍යාගරාජා කුණතීපන්** මහතා (ප්‍රධාන විධායක නිලධාරී) විසිනි. ඔහු 2020 වසරේදී තිරසාර ප්‍රජා සංවර්ධනයක් සඳහා වූ දැක්මක් ඇතිව මෙම සමාගම පිහිටුවීය."
            }
        },
        projects: {
            keywords: [
                'project', 'agriculture', 'farming', 'aloe vera', 'coconut', 'garment', 'textile', 'what do you do', 'business', // EN
                'vasayam', 'vivasaayam', 'katralai', 'thottam', 'aadai', 'factory', 'velai', // TA
                'விவசாயம்', 'கற்றாழை', 'தேங்காய்', 'ஆடை', 'தொழிற்சாலை', // TA
                'vyaapara', 'govithana', 'aloe vera', 'pol', 'garment', 'karmantha', // SI
                'ව්‍යාපාර', 'කෘෂිකර්මය', 'පොල්', 'ගාමන්ට්', 'කර්මාන්ත' // SI
            ],
            answers: {
                en: `Our core projects include:
                \n🌿 **Aloe Vera Plantation**: 500+ acres in Kilinochchi.
                \n🥥 **Coconut Cultivation**: Sustainable farming models.
                \n👕 **Garment Production**: Phase 2 community-funded factory.
                \n🌾 **Organic Farming**: Eco-friendly agriculture.`,
                ta: `எமது முக்கிய திட்டங்கள்:
                \n🌿 **கற்றாழை தோட்டம்**: கிளிநொச்சியில் 500+ ஏக்கர்.
                \n🥥 **தேங்காய் பயிர்ச்செய்கை**: நிலையான விவசாய முறைகள்.
                \n👕 **ஆடை உற்பத்தி**: சமூக நிதியுதவியுடன் கூடிய தொழிற்சாலை.
                \n🌾 **இயற்கை விவசாயம்**: சூழல் நட்பு விவசாயம்.`,
                si: `අපගේ ප්‍රධාන ව්‍යාපෘතිවලට ඇතුළත් වන්නේ:
                \n🌿 **ඇලෝවේරා වගාව**: කිලිනොච්චියේ අක්කර 500+ කට වඩා.
                \n🥥 **පොල් වගාව**: තිරසාර කෘෂිකාර්මික ආකෘති.
                \n👕 **ඇඟලුම් නිෂ්පාදනය**: ප්‍රජා අරමුදල් සහිත කර්මාන්තශාලාව.
                \n🌾 **කාබනික වගාව**: පරිසර හිතකාමී කෘෂිකර්මාන්තය.`
            }
        },
        investment: {
            keywords: [
                'investment', 'invest', 'plan', 'scheme', 'package', 'returns', 'profit', 'interest', 'roi', 'monthly', // EN
                'mudaleedu', 'muthaleedu', 'laabam', 'vatti', 'thittam', 'evvalavu varum', // TA
                'முதலீடு', 'லாபம்', 'வட்டி', 'திட்டம்', 'ஏவ்வளவு வரும்', // TA
                'aayojana', 'laaba', 'poliya', 'labena', 'plan', 'masauna', // SI
                'ආයෝජන', 'ලාභ', 'පොලිය', 'සැලැස්ම', 'මාසික' // SI
            ],
            answers: {
                en: `We offer **Structured Monthly Returns**:
                \n📅 **1 Year Protocol**: 3% Monthly
                \n📅 **2 Year Protocol**: 3.5% Monthly
                \n📅 **3 Year Protocol**: 4% Monthly
                \n💰 Principal is 100% asset-backed and returned at maturity.`,
                ta: `நாங்கள் **மாதாந்த வருமான திட்டங்களை** வழங்குகிறோம்:
                \n📅 **1 வருட திட்டம்**: மாதம் 3%
                \n📅 **2 வருட திட்டம்**: மாதம் 3.5%
                \n📅 **3 வருட திட்டம்**: மாதம் 4%
                \n💰 உங்கள் அசல் தொகை 100% பாதுகாக்கப்பட்டு முதிர்வு காலத்தில் வழங்கப்படும்.`,
                si: `අපි **සංව්‍යුහගත මාසික ප්‍රතිලාභ** ලබා දෙන්නෙමු:
                \n📅 **වසර 1 ක සැලසුම**: මාසිකව 3%
                \n📅 **වසර 2 ක සැලසුම**: මාසිකව 3.5%
                \n📅 **වසර 3 ක සැලසුම**: මාසිකව 4%
                \n💰 ඔබේ මුල් මුදල 100% සුරක්ෂිත වන අතර කාලය අවසානයේ නැවත ලබා දෙනු ලැබේ.`
            }
        },
        minimum: {
            keywords: [
                'minimum', 'lowest', 'min', 'start', 'least', 'amount', 'cost', 'limit', // EN
                'kuraintha', 'koraintha', 'alavu', 'evvalavu', 'panam', 'kasu', 'limit', // TA
                'குறைந்த', 'எவ்வளவு', 'பணம்', 'காசு', // TA
                'aduma', 'ganana', 'kiyak', 'mudal', 'salli', 'palamatheni', // SI
                'අවම', 'කීයද', 'මුදල්' // SI
            ],
            answers: {
                en: "The minimum entry investment is **LKR 100,000**. You can scale up to LKR 100 Lakhs per account.",
                ta: "குறைந்தபட்ச முதலீட்டுத் தொகை **LKR 100,000** (ஒரு லட்சம்). ஒரு கணக்கிற்கு 100 லட்சம் வரை முதலீடு செய்யலாம்.",
                si: "අවම ආයෝජන මුදල **රු. 100,000** කි. ඔබට ගිණුමකට ලක්ෂ 100 දක්වා ආයෝජනය කළ හැක."
            }
        },
        safety: {
            keywords: [
                'safe', 'secure', 'trust', 'legal', 'government', 'registered', 'reg', 'guarantee', 'risk', 'proof', // EN
                'pathukaapu', 'nambikai', 'sattam', 'arasu', 'pathivu', 'enn', 'proof', // TA
                'பாதுகாப்பு', 'நம்பிக்கை', 'சட்டம்', 'அரசு', 'பதிவு', 'உறுதி', // TA
                'arakshitha', 'vishvasa', 'neethi', 'rajaya', 'government', 'liyapadinchida', // SI
                'ආරක්ෂිත', 'විශ්වාස', 'නීති', 'රජයේ', 'ලියාපදිංචි' // SI
            ],
            answers: {
                en: "We are **PV-00303425** Government Registered. All investments are backed by tangible plantation land assets, ensuring 100% security.",
                ta: "நாங்கள் **PV-00303425** என்ற அரசாங்க பதிவு எண்ணை கொண்டுள்ளோம். அனைத்து முதலீடுகளும் நில சொத்துக்களால் பாதுகாக்கப்படுகின்றன.",
                si: "අපි **PV-00303425** යටතේ රජයේ ලියාපදිංචි වී ඇත. සියලුම ආයෝජන ඉඩම් වත්කම් මගින් සුරක්ෂිත කර ඇති බැවින් 100% ආරක්ෂිතයි."
            }
        },
        structure: {
            keywords: [
                'structure', 'branch', 'office', 'hierarchy', 'where are you', 'regional', 'zonal', 'network', // EN
                'branch', 'office', 'head office', 'regional', 'zonal', 'branch engu irukku', // TA
                'கிளை', 'அலுவலகம்', 'தலைமை', 'வலயம்', // TA
                'shakha', 'office', 'koheda', 'jala', 'shakha thiyenne', // SI
                'ශාඛා', 'කාර්යාලය', 'ජාලය', 'පිහිටීම' // SI
            ],
            answers: {
                en: "We operate a 4-tier network: **Head Office**, **Zonal Offices**, **Regional Hubs**, and **Local Branches** for nationwide support.",
                ta: "நாங்கள் 4 நிலைகளில் இயங்குகிறோம்: **தலைமை அலுவலகம்**, **வலய அலுவலகங்கள்**, **பிராந்திய மையங்கள்** மற்றும் **உள்ளூர் கிளைகள்**.",
                si: "අපි මට්ටම් 4 ක ජාලයක් ක්‍රියාත්මක කරන්නෙමු: **ප්‍රධාන කාර්යාලය**, **කලාපීය කාර්යාල**, **ප්‍රාදේශීය මධ්‍යස්ථාන** සහ **දේශීය ශාඛා**."
            }
        },
        contact: {
            keywords: [
                'contact', 'phone', 'call', 'email', 'address', 'location', 'where', 'place', 'hours', 'time', // EN
                'thodarbu', 'pesa', 'mugavari', 'idam', 'neram', 'phone number', // TA
                'தொடர்பு', 'முகவரி', 'இடம்', 'நேரம்', 'தொலைபேசி', // TA
                'amathanna', 'lipiny', 'call', 'number', 'office', 'velawa', // SI
                'අමතන්න', 'ලිපිනය', 'ස්ථානය', 'වේලාව' // SI
            ],
            answers: {
                en: `📍 **Kilinochchi Office**: No: 150, Housing Scheme, Kannakipuram.
                \n📞 **Phone**: 024 4335099
                \n✉️ **Email**: info@nfplantation.com
                \n⏰ **Hours**: Mon-Fri (8AM-5PM), Sat (10AM-2PM)`,
                ta: `📍 **கிளிநொச்சி அலுவலகம்**: No: 150, Housing Scheme, Kannakipuram.
                \n📞 **தொலைபேசி**: 024 4335099
                \n✉️ **மின்னஞ்சல்**: info@nfplantation.com
                \n⏰ **நேரம்**: திங்கள்-வெள்ளி (8AM-5PM), சனி (10AM-2PM)`,
                si: `📍 **කිලිනොච්චි කාර්යාලය**: අංක 150, නිවාස යෝජනා ක්‍රමය, කන්නකිපුරම්.
                \n📞 **දුරකථන**: 024 4335099
                \n✉️ **විද්‍යුත් තැපෑල**: info@nfplantation.com
                \n⏰ **වේලාව**: සඳුදා-සිකුරාදා (8AM-5PM), සෙනසුරාදා (10AM-2PM)`
            }
        },
        thanks: {
            keywords: [
                'thank', 'thanks', 'cool', 'good', 'ok', 'okay', 'bye', 'understood', // EN
                'nandri', 'super', 'sari', 'ok', 'bye', // TA
                'நன்றி', 'சரி', 'மிக்க நன்றி', // TA
                'sthuthi', 'elakiri', 'hari', 'thanks', // SI
                'ස්තුතියි', 'හරි', 'බොහොම ස්තුතියි' // SI
            ],
            answers: {
                en: "Happy to help! Our team at NF Plantation is always here for you. Secure your future today!",
                ta: "உங்களுக்கு உதவியதில் மகிழ்ச்சி! NF Plantation குழு எப்போதும் உங்களுக்காக உள்ளது. இன்று உங்கள் எதிர்காலத்தை உறுதிப்படுத்துங்கள்!",
                si: "ඔබට උදව් කිරීමට ලැබීම සතුටක්! NF Plantation කණ්ඩායම සැමවිටම ඔබ වෙනුවෙන් සිටී. අදම ඔබේ අනාගතය සුරක්ෂිත කරගන්න!"
            }
        }
    };

    // 3. Language Detection
    const detectLanguage = (text) => {
        // Check for Tamil Script
        if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
        // Check for Sinhala Script
        if (/[\u0D80-\u0DFF]/.test(text)) return 'si';

        // Check keywords for Romanized Tamil
        const tamilKeywords = ['vanakkam', 'mudaleedu', 'laabam', 'nandri', 'thodarbu', 'evvalavu', 'pathukaapu', 'vatti', 'mugavari'];
        if (tamilKeywords.some(w => text.toLowerCase().includes(w))) return 'ta';

        // Check keywords for Romanized Sinhala
        const sinhalaKeywords = ['ayubowan', 'kohomada', 'sthuthi', 'aayojana', 'salli', 'ganana', 'amathanna', 'hari', 'koheda'];
        if (sinhalaKeywords.some(w => text.toLowerCase().includes(w))) return 'si';

        // Default to English
        return 'en';
    };

    const processInput = (text) => {
        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);

        let bestIntent = null;
        let maxScore = 0;

        // Iterate through all intents
        for (const [intentName, intentData] of Object.entries(intents)) {
            // Check each keyword for this intent
            for (const keyword of intentData.keywords) {
                // Exact match check first for performance
                if (lowerText.includes(keyword)) {
                    // Give high score for exact match
                    if (1.0 > maxScore) {
                        maxScore = 1.0;
                        bestIntent = intentName;
                    }
                }

                // Fuzzy match check on individual words
                for (const userWord of words) {
                    const similarity = getSimilarity(userWord, keyword);
                    // Threshold: 0.75 means 75% match allowance for typos
                    if (similarity > 0.75 && similarity > maxScore) {
                        maxScore = similarity;
                        bestIntent = intentName;
                    }
                }
            }
        }

        return { intent: bestIntent, score: maxScore };
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setMessages(prev => [...prev, { type: 'user', text: userText }]);
        setInputValue("");
        setIsTyping(true);

        // Analysis
        const language = detectLanguage(userText);
        const { intent } = processInput(userText);

        setTimeout(() => {
            let responseText = "";

            if (intent) {
                responseText = intents[intent].answers[language];
            } else {
                // Fallback messages based on language
                if (language === 'ta') {
                    responseText = "மன்னிக்கவும், எனக்கு அது புரியவில்லை. முதலீடு, லாபம் அல்லது தொடர்பு பற்றி கேட்கலாம்.";
                } else if (language === 'si') {
                    responseText = "සමාවන්න, මට එය තේරුණේ නැත. ආයෝජනය, ලාභය හෝ සම්බන්ධතා ගැන ඔබට ඇසිය හැක.";
                } else {
                    responseText = "I'm not sure I understood. You can ask about **Returns**, **Minimum Investment**, **Safety**, or **Contact Details**.";
                }
            }

            setMessages(prev => [...prev, { type: 'bot', text: responseText }]);
            setIsTyping(false);
        }, 800);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const [showTooltip, setShowTooltip] = useState(true);
    const [tooltipDismissed, setTooltipDismissed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Automatically hide tooltip after 10 seconds if not clicked
        const timer = setTimeout(() => {
            if (!tooltipDismissed) setShowTooltip(false);
        }, 15000);
        return () => clearTimeout(timer);
    }, [tooltipDismissed]);

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] max-w-[90vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 font-sans">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20 overflow-hidden">
                                    <img src="https://png.pngtree.com/png-vector/20250129/ourmid/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359542.png" alt="AI Bot" className="w-full h-full object-cover scale-110" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-base">NF Support AI</h3>
                                <p className="text-[10px] text-emerald-100 opacity-90">
                                    Multilingual Assistant
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMessages([{ type: 'bot', text: "Hello! Welcome to NF Plantation. \n\nI can speak **English**, **Tamil**, and **Sinhala**. \n\nHow can I help you today?" }])}
                                className="text-emerald-100 hover:text-white transition-colors"
                                title="Reset Chat"
                            >
                                <RefreshCw size={18} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
                                <Minimize2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-950/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800">
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>

                                    {msg.type === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-200 dark:border-emerald-800">
                                            <img src="https://png.pngtree.com/png-vector/20250129/ourmid/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359542.png" alt="Bot" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                        {/* Formatting for bold/newlines */}
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={`min-h-[1.2em] ${line.trim().startsWith('-') || line.trim().startsWith('🔹') || line.trim().startsWith('✅') ? 'pl-2' : ''}`}>
                                                {line.split(/(\*\*.*?\*\*|NF Plantation)/i).map((part, j) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                                                    }
                                                    if (part.toLowerCase() === 'nf plantation') {
                                                        return <span key={j} className="notranslate" translate="no">{part}</span>;
                                                    }
                                                    return part;
                                                })}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        <img src="https://png.pngtree.com/png-vector/20250129/ourmid/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359542.png" alt="Bot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Type your message... (Tamil/Sinhala supported)"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="w-full pl-4 pr-12 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-md transform active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-4 mt-2">
                            <span className="text-[10px] text-gray-400 font-medium">English</span>
                            <span className="text-[10px] text-gray-400 font-medium">தமிழ்</span>
                            <span className="text-[10px] text-gray-400 font-medium">සිංහල</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (showTooltip || (tooltipDismissed && isHovered)) && (
                <div className="absolute bottom-16 md:bottom-20 right-0 bg-white dark:bg-gray-800 px-4 py-2 md:px-5 md:py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2 whitespace-nowrap pointer-events-auto flex items-center gap-2 md:gap-3">
                    <p className="text-xs md:text-sm font-black text-gray-800 dark:text-white tracking-tight">Need Help? Chat with us! 👋</p>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(false);
                            setTooltipDismissed(true);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                    <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-100 dark:border-gray-700"></div>
                </div>
            )}

            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowTooltip(false);
                    setTooltipDismissed(true);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all bg-gradient-to-tr from-emerald-600 to-teal-500 hover:brightness-110 text-white pointer-events-auto hover:scale-110 active:scale-90 duration-300 group relative z-50 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
            >
                {isOpen ? <X size={24} className="md:w-7 md:h-7" /> : (
                    <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <img src="https://png.pngtree.com/png-vector/20250129/ourmid/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359542.png" alt="3D Bot" className="w-full h-full object-contain filter drop-shadow-lg" />
                    </div>
                )}

                {/* Pulse Effect */}
                {!isOpen && (
                    <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-20 animate-ping"></span>
                )}
            </button>
        </div>
    );
};

export default ChatAssistant;
