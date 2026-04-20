import { Leaf, CheckCircle, TrendingUp, ShieldCheck, RefreshCw, DollarSign, Users, MapPin, Phone, Mail, Clock, Calendar, FileText, Globe } from 'lucide-react';

export const nfData = {
    headerLinks: [
        { name: 'Home', path: '/company/nf-plantation' },
        { name: 'About Us', path: '/company/nf-plantation/about' },
        { name: 'Services', path: '/company/nf-plantation/services' },
        { name: 'Investment Plans', path: '/company/nf-plantation/investment-plans' },
        { name: 'Contact', path: '/company/nf-plantation/contact' },
    ],
    home: {
        hero: {
            title: "NF Plantation",
            subtitle: "High returns for short-term investment in a government-approved investment company",
            desc: "Invest in sustainable aloe vera plantation with government backing and earn high monthly returns.",
        },
        features: [
            {
                icon: ShieldCheck,
                title: "Government Approved",
                desc: "Registered and approved investment company with legal backing"
            },
            {
                icon: TrendingUp,
                title: "High Returns",
                desc: "Up to 4% monthly returns in the third year of investment"
            },
            {
                icon: FileText,
                title: "Transparent Process",
                desc: "Clear investment terms and regular updates on your portfolio"
            }
        ],
        stats: [
            { value: "500+", label: "Happy Investors" },
            { value: "2Cr+", label: "Total Investment" },
            { value: "3-4%", label: "Monthly Returns" },
            { value: "100%", label: "Success Rate" }
        ],
        aloeSection: {
            title: "Sustainable Aloe Vera Investment",
            desc: "Our aloe vera plantation project combines environmental sustainability with profitable returns. Located in the fertile Northern Province of Kilinochchi, our farms are managed by experienced local farmers.",
            bullets: [
                "Government registered (Reg. No: 00303425)",
                "Experienced farming team",
                "Sustainable and eco-friendly practices",
                "Regular monitoring and updates"
            ]
        }
    },
    services: {
        cards: [
            {
                icon: Leaf,
                title: "Encourage Farming",
                desc: "Encouraging farming of Aloe Vera, Coconut, and other farming products to promote sustainable agriculture.",
                points: ["Aloe Vera Farming", "Coconut Cultivation", "Other Farming Products", "Sustainable Agriculture"]
            },
            {
                icon: RefreshCw,
                title: "Enhanced Lifestyle",
                desc: "Helping people move to the next step of life by producing their own products for personal use.",
                points: ["Self-production", "Lifestyle Enhancement", "Community Growth", "Next Step in Life"]
            },
            {
                icon: TrendingUp,
                title: "Motivated Savings & Investment",
                desc: "Motivating savings and investment habits for the new generation to secure their future.",
                points: ["Future Planning", "New Generation Focus", "Financial Growth", "Smart Savings"]
            },
            {
                icon: ShieldCheck,
                title: "Digital Support & Tech",
                desc: "Next-gen digital support tech to manage your secure online investment accounts.",
                points: ["Secure Operations", "Online Management", "Digital Support", "Portfolio Tracking"]
            }
        ]
    },
    about: {
        story: {
            p1: "NF Plantation was founded in 2020 with a vision to revolutionize agricultural investment in Sri Lanka. Based in the fertile lands of Kilinochchi, Northern Province, we specialize in sustainable aloe vera cultivation.",
            p2: "Our company is officially registered with the government (Registration Number: 00303425) and operates under strict compliance with all regulatory requirements. We combine traditional farming wisdom with modern agricultural techniques to ensure optimal yields.",
            regTitle: "Government Registration",
            regNum: "Registration Number: 00303425",
            regSub: "Licensed and regulated by Government of Sri Lanka"
        },
        missionVision: {
            mission: "To provide sustainable and profitable investment opportunities through responsible aloe vera cultivation, while supporting local communities and preserving the environment for future generations.",
            vision: "To become Sri Lanka's leading agricultural investment company, known for transparency, sustainability, and exceptional returns while contributing to the economic development of Northern Province."
        },
        values: [
            { icon: ShieldCheck, title: "Transparency", desc: "Complete transparency in all our operations and investment processes" },
            { icon: Users, title: "Community", desc: "Supporting local farmers and creating sustainable employment" },
            { icon: Leaf, title: "Sustainability", desc: "Eco-friendly farming practices that protect our environment" }
        ],
        timeline: [
            { year: "2020", title: "Company Founded", desc: "NF Plantation established with government registration" },
            { year: "2021", title: "First Plantation", desc: "100 acres of aloe vera plantation started in Kilinochchi" },
            { year: "2022", title: "500+ Investors", desc: "Reached milestone of 500 satisfied investors" },
            { year: "2023", title: "Expansion", desc: "Expanded to 500 acres with advanced farming techniques" }
        ]
    },
    investment: {
        tableRows: [
            { amount: "LKR 1,00,000", y1: "LKR 3,000", y2: "LKR 3,500", y3: "LKR 4,000", total: "LKR 1,26,000" },
            { amount: "LKR 2,00,000", y1: "LKR 6,000", y2: "LKR 7,000", y3: "LKR 8,000", total: "LKR 2,52,000" },
            { amount: "LKR 5,00,000", y1: "LKR 15,000", y2: "LKR 17,500", y3: "LKR 20,000", total: "LKR 6,30,000" },
            { amount: "LKR 10,00,000", y1: "LKR 30,000", y2: "LKR 35,000", y3: "LKR 40,000", total: "LKR 12,60,000" },
            { amount: "LKR 20,00,000", y1: "LKR 60,000", y2: "LKR 70,000", y3: "LKR 80,000", total: "LKR 25,20,000" },
            { amount: "LKR 50,00,000", y1: "LKR 1,50,000", y2: "LKR 1,75,000", y3: "LKR 2,00,000", total: "LKR 63,00,000" },
        ],
        terms: [
            "Minimum investment amount: LKR 100,000",
            "Investment period: 3 years (36 months)",
            "Monthly returns are credited on the 1st of each month",
            "Principal amount is returned at the end of 3 years",
            "All investments are backed by aloe vera plantation assets",
            "Government registered company (Reg. No: 00303425)",
            "Early withdrawal may incur penalties as per agreement"
        ]
    },
    contact: {
        address: "No: 150, Housing Scheme, Kannakipuram West, Kannakipuram, Kilinochchi.",
        phone: "024 4335099",
        email: "info@nfplantation.com",
        hoursM_F: "08:00 AM - 05:00 PM",
        hoursSat: "10:00 AM - 02:00 PM"
    }
};
