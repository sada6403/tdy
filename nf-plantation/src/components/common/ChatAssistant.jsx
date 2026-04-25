import React, { useEffect, useRef, useState } from "react";
import { Send, X, Minimize2, RefreshCw, ChevronRight } from "lucide-react";

const BOT_IMG =
  "https://png.pngtree.com/png-vector/20250129/ourmid/pngtree-chatbot-symbol-3d-icon-isolated-on-a-transparent-background-symbolizing-ai-png-image_15359542.png";

// ---------------------------------------------------------------------------
// KNOWLEDGE BASE  —  20 intents · EN / TA / SI · typo-tolerant NLP
// ---------------------------------------------------------------------------
const KB = {
  greeting: {
    phrases: ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "start", "help me", "what can you do",
      "vanakkam", "vannakkam", "nalam", "enna seyya mudium", "help panunga",
      "வணக்கம்", "ஹலோ", "நலம்",
      "ayubowan", "kohomada", "helo",
      "ආයුබෝවන්", "කොහොමද", "හෙලෝ"],
    answers: {
      en: "👋 Hello! Welcome to **NF Plantation** Support.\n\nI can help you with:\n• 💰 Investment plans & monthly returns\n• 📥 Deposits & withdrawals\n• 🏦 Wallet, escrow & transactions\n• ⚙️ Account / login issues\n• 📞 Contact & office hours\n\nWhat would you like to know?",
      ta: "👋 வணக்கம்! **NF Plantation** உதவி மையத்திற்கு வரவேற்கிறோம்.\n\nநான் உதவக்கூடியவை:\n• 💰 முதலீட்டு திட்டங்கள் & மாத வருமானம்\n• 📥 டிபாசிட் & திரும்பப் பெறுதல்\n• 🏦 வாலட், எஸ்க்ரோ & பரிவர்த்தனைகள்\n• ⚙️ கணக்கு / உள்நுழைவு சிக்கல்கள்\n• 📞 தொடர்பு & அலுவலக நேரம்",
      si: "👋 ආයුබෝවන්! **NF Plantation** සහාය සේවාවට සාදරයෙන් පිළිගනිමු.\n\nමට සහාය විය හැකි ක්ෂේත්‍ර:\n• 💰 ආයෝජන සැලසුම් & මාසික ප්‍රතිලාභ\n• 📥 තැන්පතු & ආපසු ගැනීම\n• 🏦 Wallet, Escrow & ගනුදෙනු\n• ⚙️ ගිණුම් / ලොගින් ගැටළු\n• 📞 සම්බන්ධතා & කාර්යාල වේලාවන්",
    },
    quick: ["Investment plans", "How to invest", "Deposit steps", "Contact"],
  },

  investment_plans: {
    phrases: ["investment", "invest", "plan", "plans", "scheme", "package", "returns", "profit", "interest", "roi",
      "monthly return", "interest rate", "how much return", "what plans", "available plans", "show plans",
      "mudaleedu", "muthaleedu", "laabam", "vatti", "thittam", "thittangal", "evvalavu varum", "maatha laabam",
      "enna plan", "plan vivaram", "plan pathi", "mudali poda",
      "முதலீடு", "லாபம்", "வட்டி", "திட்டம்", "திட்டங்கள்", "மாத வருமானம்", "எவ்வளவு வரும்",
      "aayojana", "laaba", "poliya", "labena", "masauna", "plan thiyanawada",
      "ආයෝජන", "ලාභ", "පොලිය", "සැලැස්ම", "මාසික ප්‍රතිලාභ"],
    answers: {
      en: "💼 **NF Plantation Investment Plans**\n\n📅 **1-Year Plan** — 3% / month\n   LKR 1 Lakh → LKR 3,000/mo · Total profit: LKR 36,000\n\n📅 **2-Year Plan** — 3.5% / month\n   LKR 1 Lakh → LKR 3,500/mo · Total profit: LKR 84,000\n\n📅 **3-Year Plan** — 4% / month\n   LKR 1 Lakh → LKR 4,000/mo · Total profit: LKR 1,44,000\n\n💰 Minimum: LKR 1,00,000 · Maximum: LKR 1 Crore\n🔒 100% asset-backed. Full principal returned at maturity.",
      ta: "💼 **NF Plantation முதலீட்டு திட்டங்கள்**\n\n📅 **1 வருட திட்டம்** — மாதம் 3%\n   1 லட்சம் → மாதம் LKR 3,000 · மொத்த லாபம்: LKR 36,000\n\n📅 **2 வருட திட்டம்** — மாதம் 3.5%\n   1 லட்சம் → மாதம் LKR 3,500 · மொத்த லாபம்: LKR 84,000\n\n📅 **3 வருட திட்டம்** — மாதம் 4%\n   1 லட்சம் → மாதம் LKR 4,000 · மொத்த லாபம்: LKR 1,44,000\n\n💰 குறைந்தபட்சம்: LKR 1,00,000 · அதிகபட்சம்: LKR 1 கோடி\n🔒 100% சொத்து ஆதரவு. முதிர்வில் முழு அசல் திரும்பும்.",
      si: "💼 **NF Plantation ආයෝජන සැලසුම්**\n\n📅 **වසර 1 ක සැලසුම** — මාසිකව 3%\n   ලක්ෂ 1 → LKR 3,000/මාස · ලාභය: LKR 36,000\n\n📅 **වසර 2 ක සැලසුම** — මාසිකව 3.5%\n   ලක්ෂ 1 → LKR 3,500/මාස · ලාභය: LKR 84,000\n\n📅 **වසර 3 ක සැලසුම** — මාසිකව 4%\n   ලක්ෂ 1 → LKR 4,000/මාස · ලාභය: LKR 1,44,000\n\n💰 අවම: LKR 1,00,000 · උපරිම: LKR 1 කෝටිය\n🔒 100% දේපල ආධාරක. කාලය අවසානයේ ප්‍රාග්ධනය ආපසු.",
    },
    quick: ["How to invest", "Minimum amount", "Safety guarantee", "Wallet vs Bank"],
  },

  how_to_invest: {
    phrases: ["how to invest", "how invest", "start investing", "begin investment", "sign up", "create account",
      "open account", "apply", "new account", "join", "become member", "steps to invest", "investment process", "how to start",
      "eppadi mudalidu", "eppadi thottanguvadu", "puthiya account", "register aavadu", "apply panunga",
      "mudalidu panuvadu eppadi", "join aavadu",
      "எப்படி முதலீடு", "புதிய கணக்கு", "சேர்வது எப்படி",
      "kohomadha aayojana karana", "kothanin pittupada", "account hodaganna", "puthu account",
      "ආයෝජනය කරන්නේ කෙසේද", "ගිණුම් ආරම්භ"],
    answers: {
      en: "📋 **How to Start Investing — Step by Step**\n\n**Step 1 — Register**\nCreate your account at the portal with your NIC & bank details.\n\n**Step 2 — Deposit Funds**\nTransfer your investment amount to our bank & upload the receipt.\n\n**Step 3 — Admin Approval** ⏱️ ~24 hrs\nOur team verifies and credits your wallet.\n\n**Step 4 — Choose a Plan**\nSelect 1 / 2 / 3-year plan and profit destination (Wallet or Bank).\n\n**Step 5 — Activation ✅**\nPlan goes ACTIVE. Monthly returns begin the next month!",
      ta: "📋 **முதலீடு தொடங்குவது எப்படி — படிப்படியாக**\n\n**படி 1 — பதிவு**\nNIC & வங்கி விவரங்களுடன் தளத்தில் கணக்கு உருவாக்கவும்.\n\n**படி 2 — பணம் போடவும்**\nதொகையை வங்கிக்கு மாற்றி தளத்தில் ரசீது பதிவேற்றவும்.\n\n**படி 3 — நிர்வாக அனுமதி** ⏱️ ~24 மணி\nகுழு சரிபார்த்து டிபாசிட்டை அனுமதிக்கும்.\n\n**படி 4 — திட்டம் தேர்வு**\n1 / 2 / 3 வருட திட்டம் & லாப இலக்கு (வாலட் / வங்கி) தேர்வு.\n\n**படி 5 — செயல்படுத்தல் ✅**\nதிட்டம் ACTIVE ஆகும். அடுத்த மாதம் வருமானம் தொடங்கும்!",
      si: "📋 **ආයෝජනය ආරම්භ කරන ආකාරය — පියවරෙන් පියවර**\n\n**පියවර 1 — ලියාපදිංචිය**\nNIC & බැංකු විස්තර සමඟ ද්වාරයෙහි ගිණුමක් සාදන්න.\n\n**පියවර 2 — මුදල් තැන්පත් කරන්න**\nමුදල් බැංකු ගිණුමට යවා ද්වාරයෙහි රිසිට්පත upload කරන්න.\n\n**පියවර 3 — අනුමැතිය** ⏱️ ~24 පැය\nකණ්ඩායම සත්‍යාපනය කර Wallet ශේෂ ජමා කරනු ලැබේ.\n\n**පියවර 4 — සැලසුමක් තෝරන්න**\n1 / 2 / 3 වසර සැලසුම & ලාභ ගමනාන්තය (Wallet / Bank) තෝරන්න.\n\n**පියවර 5 — සක්‍රිය කිරීම ✅**\nසැලසුම ACTIVE. ලබන මාසයේ ප්‍රතිලාභ ආරම්භ!",
    },
    quick: ["Deposit steps", "Investment plans", "Wallet vs Bank", "Contact"],
  },

  deposit: {
    phrases: ["deposit", "fund", "transfer money", "add money", "top up", "add funds", "bank transfer", "how to pay",
      "send money", "bank account", "account number", "how to deposit", "cant deposit", "deposit failed",
      "pending deposit", "deposit not credited", "deposit not showing", "deposit problem", "slip", "receipt",
      "deposit panuvadu", "panam pottu", "account kku panam", "deposit panna", "deposit pending",
      "டிபாசிட்", "பணம் போடுவது", "வங்கி பரிமாற்றம்", "ஸ்லிப்",
      "thanapathu", "thanapathu karana", "panam yawanawa", "bank transfer karana",
      "තැන්පතු", "මුදල් යැවීම", "බැංකු ගිණුම"],
    answers: {
      en: "📥 **How to Make a Deposit**\n\n**1. Transfer Funds**\nBank: People's Bank / Bank of Ceylon\nAccount: NF Plantation (Pvt) Ltd — Kilinochchi Branch\n\n**2. Upload Slip**\nPortal → Wallet → Deposit Request → Upload bank slip\n\n**3. Wait for Approval** ⏱️\nAdmin approves within **24 business hours**\n\n**4. Funds Credited ✅**\nAppears in Available Balance after approval.\n\n⚠️ Not credited after 24h? Call **024 4335099** with your slip reference.",
      ta: "📥 **டிபாசிட் செய்வது எப்படி**\n\n**1. பணம் மாற்றவும்**\nவங்கி: People's Bank / Bank of Ceylon\nகணக்கு: NF Plantation (Pvt) Ltd — கிளிநொச்சி கிளை\n\n**2. சீட்டு பதிவேற்றவும்**\nதளம் → Wallet → Deposit Request → வங்கி சீட்டை பதிவேற்றவும்\n\n**3. அனுமதிக்காக காத்திருக்கவும்** ⏱️\nவணிக நாட்களில் **24 மணி நேரத்தில்** அனுமதிக்கப்படும்\n\n**4. பணம் கிரெடிட் ✅**\nட்டு Available Balance ல் தெரியும்.\n\n⚠️ 24 மணிக்கு பிறகும் கிரெடிட் ஆகவில்லையா? சீட்டு குறிப்பு எண்ணுடன் **024 4335099** அழைக்கவும்.",
      si: "📥 **තැන්පතුවක් කරන ආකාරය**\n\n**1. මුදල් මාරු කරන්න**\nබැංකු: People's Bank / Bank of Ceylon\nගිණුම: NF Plantation (Pvt) Ltd — කිලිනොච්චි ශාඛාව\n\n**2. රිසිට්පත Upload කරන්න**\nද්වාරය → Wallet → Deposit Request → රිසිට්පත upload\n\n**3. අනුමැතිය** ⏱️\n**ව්‍යාපාරික පැය 24** ඇතුළත අනුමත කෙරේ\n\n**4. ශේෂ ජමා ✅**\nAvailable Balance හි දිස්වේ.\n\n⚠️ 24ගෙවී ජමා නොවූ නම්? **024 4335099** ට රිසිට්පත් යොමු සමඟ අමතන්න.",
    },
    quick: ["Deposit not credited", "Withdrawal process", "Check wallet", "Contact support"],
  },

  deposit_problem: {
    phrases: ["deposit not credited", "deposit problem", "slip uploaded not approved", "deposit failed",
      "deposit not approved", "my deposit is stuck", "waiting for deposit approval", "deposit pending too long",
      "deposit aagalai", "slip pottachu approve aagalai", "deposit stuck",
      "டிபாசிட் கிரெடிட் ஆகவில்லை", "டிபாசிட் பிரச்சினை",
      "thanapathu naha", "deposit naha",
      "තැන්පතු ගැටළු", "ශේෂ ජමා නොවීම"],
    answers: {
      en: "⚠️ **Deposit Not Credited?**\n\n**Check these first:**\n☐ Did you upload the bank slip in the portal?\n☐ Is the slip image clear (not blurry)?\n☐ Has it been over **24 business hours**?\n☐ Was the transfer to the correct account?\n\n**If all done and still pending — contact us immediately:**\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nProvide: Account email · Slip / transaction reference · Amount & date\n\n⏱️ We resolve deposit issues within **4 hours** of reporting.",
      ta: "⚠️ **டிபாசிட் கிரெடிட் ஆகவில்லையா?**\n\n**முதலில் சரிபார்க்கவும்:**\n☐ தளத்தில் வங்கி சீட்டை பதிவேற்றினீர்களா?\n☐ சீட்டு படம் தெளிவாக உள்ளதா?\n☐ **24 வணிக மணி நேரம்** கடந்ததா?\n☐ சரியான கணக்கிற்கு பரிமாற்றம் செய்தீர்களா?\n\n**எல்லாம் சரியாக இருந்தும் நிலுவையில் இருந்தால்:**\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nகொடுக்கவும்: கணக்கு மின்னஞ்சல் · சீட்டு குறிப்பு எண் · தொகை & தேதி\n\n⏱️ தகவல் கொடுத்த **4 மணி நேரத்தில்** தீர்க்கிறோம்.",
      si: "⚠️ **තැන්පතුව ශේෂ ජමා නොවූ නම්?**\n\n**පළමු පරීක්ෂා කරන්න:**\n☐ ද්වාරයෙහි රිසිට්පත upload කළාද?\n☐ රිසිට්පත් ඡායාරූපය පැහැදිලිද?\n☐ **ව්‍යාපාරික පැය 24** ගත වූවාද?\n☐ නිවැරදි ගිණුමට මාරු කළාද?\n\n**සිදු කිරීමෙන් පසු රැඳී ඇත්නම් — වහාම සම්බන්ධ වන්න:**\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nලබා දෙන්න: ගිණුම් email · රිසිට්පත් යොමු · මුදල & දිනය\n\n⏱️ **පැය 4** ඇතුළත විසඳනු ලැබේ.",
    },
    quick: ["How to deposit", "Contact support", "Check wallet", "Withdrawal"],
  },

  withdrawal: {
    phrases: ["withdraw", "withdrawal", "take money", "cash out", "get money back", "remove money",
      "send to bank", "how to withdraw", "withdrawal process", "withdrawal time", "when will i get money",
      "withdraw request", "withdrawal not done", "withdrawal delayed",
      "edukuvadu", "thirumba peruvathu", "panam edukkanum", "withdraw panna", "bank kku poda",
      "panam எடுப்பது", "திரும்பப் பெறுதல்",
      "ganna", "panam ganna", "bank ekata yawanawa", "withdraw karana",
      "මුදල් ආපසු ගැනීම", "ආපසු ගන්නේ කෙසේද"],
    answers: {
      en: "💸 **Withdrawal Process**\n\n**From Wallet Balance:**\n1. Dashboard → Wallet → Withdraw\n2. Enter amount & bank details\n3. Admin processes in **2–3 business days**\n\n**Monthly Returns — BANK destination:**\nProfit goes to **Held Balance (Escrow)** first. Admin confirms bank transfer → funds released from escrow → recorded in Transaction History.\n\n**Monthly Returns — WALLET destination:**\nProfit auto-credited each month. Withdraw anytime.\n\n⚠️ Delayed beyond 3 days? 📞 **024 4335099**",
      ta: "💸 **திரும்பப் பெறும் செயல்முறை**\n\n**வாலட் இருப்பிலிருந்து:**\n1. Dashboard → Wallet → Withdraw\n2. தொகை & வங்கி விவரங்கள் உள்ளிடவும்\n3. நிர்வாகி **2–3 வணிக நாட்களில்** செயல்படுத்துவார்\n\n**மாத வருமானம் — வங்கி இலக்கு:**\nலாபம் முதலில் **Held Balance (Escrow)** ல் செல்லும். நிர்வாகி உறுதிப்படுத்திய பின் Transaction History ல் தெரியும்.\n\n**மாத வருமானம் — வாலட் இலக்கு:**\nஒவ்வொரு மாதமும் தானாக கிரெடிட். எப்போதும் எடுக்கலாம்.\n\n⚠️ 3 நாட்களுக்கும் மேல் தாமதமா? 📞 **024 4335099**",
      si: "💸 **ආපසු ගැනීමේ ක්‍රියාවලිය**\n\n**Wallet ශේෂයෙන්:**\n1. Dashboard → Wallet → Withdraw\n2. මුදල & බැංකු විස්තර ඇතුළත් කරන්න\n3. **ව්‍යාපාරික දින 2–3** ක් ඇතුළත සිදු කෙරේ\n\n**මාසික ලාභ — BANK ගමනාන්තය:**\nලාභය **Held Balance (Escrow)** ට යයි. පරිපාලකය තහවුරු කළ පසු Transaction History.\n\n**මාසික ලාභ — WALLET ගමනාන්තය:**\nසෑම මාසයකම ස්වයංක්‍රීය ශේෂ ජමා. ඕනෑම වේලාවක ගත හැකිය.\n\n⚠️ දින 3 ගත වී නොලැබෙන්නේ නම්? 📞 **024 4335099**",
    },
    quick: ["Check wallet balance", "Profit not received", "Transaction history", "Contact support"],
  },

  wallet: {
    phrases: ["wallet", "balance", "check balance", "available balance", "held balance", "escrow",
      "total balance", "wallet balance", "my balance", "how much money", "wallet status",
      "iruppu", "panam irukkaa", "ethanai panam", "held amount",
      "வாலட்", "இருப்பு", "எவ்வளவு பணம்",
      "kiyada thiyanawa", "wallet eke salli",
      "පසුම්බිය", "ශේෂය", "කීයද"],
    answers: {
      en: "🏦 **Your Wallet — Explained**\n\n💚 **Available Balance**\nMoney you can withdraw or reinvest right now.\n\n🟡 **Held Balance (Escrow)**\nMonthly returns held until admin confirms the bank transfer. Auto-released after confirmation.\n\n📊 **Total Balance** = Available + Held\n🏅 **Total Earned** = Cumulative profit credited so far\n\n📍 To check: Login → Dashboard → **Wallet**\nAll movements logged in **Transaction History** in real-time.",
      ta: "🏦 **உங்கள் வாலட் — விளக்கம்**\n\n💚 **Available Balance**\nஇப்போது எடுக்கவோ முதலீடு செய்யவோ கூடிய பணம்.\n\n🟡 **Held Balance (Escrow)**\nநிர்வாகி வங்கி பரிமாற்றம் உறுதிப்படுத்தும் வரை வைத்திருக்கும் மாத வருமானம். உறுதிப்படுத்திய பிறகு தானாக விடுவிக்கப்படும்.\n\n📊 **Total Balance** = Available + Held\n🏅 **Total Earned** = இதுவரை கிரெடிட் ஆன மொத்த லாபம்\n\n📍 சரிபார்க்க: Login → Dashboard → **Wallet**\nஅனைத்தும் **Transaction History** ல் நேரடியாக பதிவாகும்.",
      si: "🏦 **ඔබේ Wallet — පැහැදිලිව**\n\n💚 **Available Balance**\nදැන් ආපසු ගත හැකි හෝ ආයෝජනය කළ හැකි මුදල.\n\n🟡 **Held Balance (Escrow)**\nබැංකු ගෙවීම තහවුරු වන තුරු රැඳෙන ලාභ. ස්වයංක්‍රීයව නිදහස් වේ.\n\n📊 **Total Balance** = Available + Held\n🏅 **Total Earned** = දක්වා ශේෂ ජමා ලාභ\n\n📍 බලාගැනීමට: Login → Dashboard → **Wallet**\nසියළු ගනුදෙනු **Transaction History** හි ලයිව්.",
    },
    quick: ["Profit not credited", "Withdrawal process", "Transaction history", "Contact support"],
  },

  transaction: {
    phrases: ["transaction", "history", "statement", "record", "activity", "transaction history",
      "payment history", "past transactions", "credit", "debit", "money movement",
      "parivarthanai", "varalaru", "aanachu",
      "பரிவர்த்தனை", "வரலாறு",
      "ganuda", "itihasaya",
      "ගනුදෙනු", "ඉතිහාසය"],
    answers: {
      en: "📋 **Transaction History**\n\n📍 Location: Login → Dashboard → Wallet → **Transaction History**\n\n**Types you will see:**\n💚 **EARNING** — Monthly profit credited\n🔵 **DEPOSIT** — Funds added to wallet\n🔴 **WITHDRAWAL** — Money sent to your bank\n🟡 **INVESTMENT** — Capital moved into plan\n\nEach entry shows: Date · Amount · Reference No. · Status\n\n💡 Every profit payout, deposit approval, and withdrawal is recorded automatically.",
      ta: "📋 **பரிவர்த்தனை வரலாறு**\n\n📍 இடம்: Login → Dashboard → Wallet → **Transaction History**\n\n**தெரியும் வகைகள்:**\n💚 **EARNING** — மாத லாபம் கிரெடிட்\n🔵 **DEPOSIT** — வாலட்டில் பணம் சேர்க்கப்பட்டது\n🔴 **WITHDRAWAL** — வங்கிக்கு பணம் அனுப்பப்பட்டது\n🟡 **INVESTMENT** — திட்டத்தில் முதலீடு\n\nஒவ்வொரு பதிவிலும்: தேதி · தொகை · குறிப்பு எண் · நிலை\n\n💡 ஒவ்வொரு லாபம், டிபாசிட் அனுமதி, திரும்பப் பெறுதல் தானாக பதிவாகும்.",
      si: "📋 **ගනුදෙනු ඉතිහාසය**\n\n📍 ස්ථානය: Login → Dashboard → Wallet → **Transaction History**\n\n**දිස්වන වර්ග:**\n💚 **EARNING** — මාසික ලාභ ශේෂ ජමා\n🔵 **DEPOSIT** — Wallet ට ශේෂ ජමා\n🔴 **WITHDRAWAL** — බැංකුවට යවන ලද\n🟡 **INVESTMENT** — සැලසුමට ආයෝජනය\n\nසෑම සටහනකම: දිනය · මුදල · යොමු අංකය · තත්ත්වය",
    },
    quick: ["Profit not credited", "Wallet balance", "Withdrawal process", "Contact"],
  },

  profit_not_received: {
    phrases: ["profit not received", "return not credited", "monthly return missing", "profit missing",
      "money not credited", "where is my profit", "profit delayed", "earning not credited",
      "profit problem", "return not showing", "profit not showing",
      "laabam varalai", "maatha panam varalai", "profit vandha illa", "credit aakalai",
      "maaatha panam varala", "pairam vandha illa",
      "லாபம் வரவில்லை", "மாத பணம் வரவில்லை", "கிரெடிட் ஆகவில்லை",
      "laabaya naha", "salli nadha", "masika labaya naha", "credit naha",
      "ලාභය ලැබුණේ නැත", "සල්ලි ලැබුණේ නැත"],
    answers: {
      en: "⚠️ **Monthly Profit Not Received?**\n\n**Step 1 — Check Payout Date**\nProfit is credited on the monthly anniversary of your plan start date.\n(e.g. Started Jan 15 → Profit on Feb 15, Mar 15...)\n\n**Step 2 — Check Profit Destination**\n• **WALLET** → look in Available Balance\n• **BANK** → profit goes to **Held Balance (Escrow)** first. Admin confirms bank transfer, then it appears in Transaction History.\n\n**Step 3 — Still missing?**\nContact us with your Account ID & Investment Ref. No.:\n📞 **024 4335099**\n✉️ **info@nfplantation.com**",
      ta: "⚠️ **மாத லாபம் வரவில்லையா?**\n\n**படி 1 — கட்டண தேதி சரிபார்க்கவும்**\nதிட்டம் தொடங்கிய தேதியின் மாதாந்த நாளன்று லாபம் கிரெடிட் ஆகும்.\n(உதா. ஜன 15 தொடங்கினால் → பிப் 15, மார் 15...)\n\n**படி 2 — லாப இலக்கை சரிபார்க்கவும்**\n• **WALLET** → Available Balance சரிபார்க்கவும்\n• **BANK** → லாபம் முதலில் **Held Balance (Escrow)** ல் செல்லும். நிர்வாகி உறுதிப்படுத்திய பின் Transaction History ல் தெரியும்.\n\n**படி 3 — இன்னும் தெரியவில்லையா?**\nகணக்கு ID & முதலீட்டு குறிப்பு எண்ணுடன் தொடர்பு கொள்ளுங்கள்:\n📞 **024 4335099**\n✉️ **info@nfplantation.com**",
      si: "⚠️ **මාසික ලාභය ලැබෙනවාද?**\n\n**පියවර 1 — ගෙවීමේ දිනය**\nලාභය සැලසුම ආරම්භ කළ දිනයේ මාසික සංවත්සරයේ ශේෂ ජමා වේ.\n(උදා: ජන. 15 ආරම්භ → පෙබ. 15, මාර්. 15...)\n\n**පියවර 2 — ලාභ ගමනාන්තය**\n• **WALLET** → Available Balance බලන්න\n• **BANK** → ලාභය **Held Balance (Escrow)** ට යයි. පරිපාලකය තහවුරු කළ පසු Transaction History.\n\n**පියවර 3 — තවමත් නොලැබෙන්නේ නම්?**\nගිණුම් ID & ආයෝජන Ref. සමඟ:\n📞 **024 4335099**\n✉️ **info@nfplantation.com**",
    },
    quick: ["Check wallet balance", "Wallet vs Bank", "Transaction history", "Contact support"],
  },

  login_issues: {
    phrases: ["login", "cant login", "cannot login", "login problem", "forgot password", "password reset",
      "password forgotten", "reset password", "account locked", "login failed",
      "wrong password", "otp", "not able to login", "otp not received",
      "login aagala", "password marantha", "login seiyal mudiyala", "otp varala",
      "லாகின் ஆகவில்லை", "பாஸ்வர்ட் மறந்தது",
      "login naha", "password maricha", "otp naha",
      "ලොගින් නොවේ", "මුරපදය අමතකද"],
    answers: {
      en: "🔐 **Login / Password Help**\n\n**Forgot Password:**\n1. Login page → click **\"Forgot Password\"**\n2. Enter your registered email\n3. Check inbox & Spam for reset link\n4. Set new password and log in\n\n**OTP Not Received:**\n• Check registered mobile & email\n• Wait 2 minutes, then request again\n• Ensure SMS is not blocked\n\n**Account Locked?**\nToo many failed attempts locks for **30 minutes**. Wait or contact support.\n\n📞 Account recovery: **024 4335099**",
      ta: "🔐 **Login / Password உதவி**\n\n**Password மறந்தால்:**\n1. Login பக்கம் → **\"Forgot Password\"** கிளிக்\n2. பதிவு செய்த மின்னஞ்சல் உள்ளிடவும்\n3. Inbox & Spam பார்க்கவும்\n4. புதிய password அமைத்து login செய்யவும்\n\n**OTP வரவில்லையா:**\n• பதிவு செய்த மொபைல் & மின்னஞ்சல் சரிபார்க்கவும்\n• 2 நிமிடம் காத்து மீண்டும் கேளுங்கள்\n\n**கணக்கு பூட்டப்பட்டதா?**\nதொடர்ந்த தவறான முயற்சிகள் **30 நிமிடங்களுக்கு** பூட்டும்.\n\n📞 கணக்கு மீட்டெடுக்க: **024 4335099**",
      si: "🔐 **Login / Password සහාය**\n\n**Password අමතකද:**\n1. Login → **\"Forgot Password\"** click\n2. ලියාපදිංචි email ඇතුළත් කරන්න\n3. Inbox & Spam පරීක්ෂා කරන්න\n4. නව password සකසා login\n\n**OTP ලැබෙනවාද:**\n• ලියාපදිංචි mobile & email පරීක්ෂා\n• මිනිත්තු 2ක් රැඳී නැවත ඉල්ලන්න\n\n**ගිණුම Locked ද?**\nවැරදි ප්‍රයත්ත **30 මිනිත්තු** lock.\n\n📞 ගිණුම් recovery: **024 4335099**",
    },
    quick: ["Contact support", "Deposit issue", "Withdrawal issue", "Investment plans"],
  },

  minimum: {
    phrases: ["minimum", "lowest", "min", "how much to invest", "minimum investment", "min amount",
      "smallest amount", "maximum", "max", "limit", "how much can i invest",
      "kuraintha", "koraintha", "alavu", "evvalavu", "minimum amount",
      "குறைந்த", "எவ்வளவு", "குறைந்தபட்சம்",
      "aduma", "ganana", "kiyak",
      "අවම", "කීයද", "මුදල්"],
    answers: {
      en: "💰 **Investment Limits**\n\n🟢 **Minimum**: LKR **1,00,000** (One Lakh)\n🔵 **Maximum**: LKR **1,00,00,000** (One Crore) per account\n\n**Example Returns on LKR 1,00,000:**\n• 1-Year (3%): LKR 3,000/mo · Total: LKR 36,000\n• 2-Year (3.5%): LKR 3,500/mo · Total: LKR 84,000\n• 3-Year (4%): LKR 4,000/mo · Total: LKR 1,44,000\n\n✅ Full principal returned at maturity in all plans.",
      ta: "💰 **முதலீட்டு வரம்புகள்**\n\n🟢 **குறைந்தபட்சம்**: LKR **1,00,000** (ஒரு லட்சம்)\n🔵 **அதிகபட்சம்**: ஒரு கணக்கிற்கு LKR **1,00,00,000** (ஒரு கோடி)\n\n**LKR 1,00,000 க்கு வருமானம்:**\n• 1 வருட (3%): மாதம் 3,000 · மொத்தம்: 36,000\n• 2 வருட (3.5%): மாதம் 3,500 · மொத்தம்: 84,000\n• 3 வருட (4%): மாதம் 4,000 · மொத்தம்: 1,44,000\n\n✅ முதிர்வில் முழு அசல் திரும்பும்.",
      si: "💰 **ආයෝජන සීමාවන්**\n\n🟢 **අවම**: LKR **1,00,000** (ලක්ෂයක්)\n🔵 **උපරිම**: LKR **1,00,00,000** (කෝටියක්) ගිණුමකට\n\n**LKR 1,00,000 ට ප්‍රතිලාභ:**\n• වසර 1 (3%): LKR 3,000/මාස · ලාභය: 36,000\n• වසර 2 (3.5%): LKR 3,500/මාස · ලාභය: 84,000\n• වසර 3 (4%): LKR 4,000/මාස · ලාභය: 1,44,000\n\n✅ කාලය අවසානයේ සම්පූර්ණ ප්‍රාග්ධනය ආපසු.",
    },
    quick: ["Investment plans", "How to invest", "Safety guarantee", "Contact"],
  },

  safety: {
    phrases: ["safe", "secure", "trust", "legal", "government", "registered", "guarantee", "risk",
      "proof", "authentic", "scam", "reliable", "is it safe", "can i trust",
      "pathukaapu", "nambikai", "sattam", "arasu", "pathivu", "nambagumaa",
      "பாதுகாப்பு", "நம்பிக்கை", "நம்பலாமா", "சட்டம்",
      "arakshitha", "vishvasa", "nambakarana",
      "ආරක්ෂිත", "විශ්වාස", "නීති"],
    answers: {
      en: "🔒 **Is NF Plantation Safe?**\n\n✅ **Government Registered**: PV-00303425 (Sri Lanka)\n✅ **Asset-Backed**: Investments secured by physical plantation land in Kilinochchi\n✅ **Live Dashboard**: Real-time view of all your investments and returns\n✅ **Consistent Payouts**: Monthly returns paid on time every month\n✅ **Since 2020**: 5+ years operating with hundreds of satisfied investors\n\n📜 Verify at: Registrar of Companies, Sri Lanka\n📞 Questions? **024 4335099**",
      ta: "🔒 **NF Plantation நம்பகமானதா?**\n\n✅ **அரசாங்க பதிவு**: PV-00303425 (இலங்கை)\n✅ **சொத்து ஆதரவு**: கிளிநொச்சியில் உடல் தோட்ட நிலங்களால் முதலீடுகள் பாதுகாக்கப்படுகின்றன\n✅ **நேரடி Dashboard**: அனைத்து முதலீடுகள் & வருமானங்களை நேரடியாக பார்க்கலாம்\n✅ **தொடர்ந்த வருமானம்**: ஒவ்வொரு மாதமும் சரியான நேரத்தில்\n✅ **2020 முதல்**: 5+ வருட அனுபவம், நூற்றுக்கணக்கான நம்பகமான முதலீட்டாளர்கள்\n\n📞 கேள்விகளா? **024 4335099**",
      si: "🔒 **NF Plantation ආරක්ෂිතද?**\n\n✅ **රජයේ ලියාපදිංචිය**: PV-00303425 (ශ්‍රී ලංකාව)\n✅ **දේපල ආධාරක**: කිලිනොච්චියේ ඉඩමෙන් ආරක්ෂිතයි\n✅ **ලයිව් Dashboard**: ලයිව් ආයෝජන & ප්‍රතිලාභ\n✅ **නිරන්තර ගෙවීම**: සෑම මාසයකම නිවැරදිව\n✅ **2020 සිට**: 5+ වසරක් ක්‍රියාත්මක\n\n📞 ප්‍රශ්නද? **024 4335099**",
    },
    quick: ["Investment plans", "Minimum amount", "How to invest", "Contact"],
  },

  maturity: {
    phrases: ["maturity", "mature", "plan end", "when does plan end", "principal return", "capital back",
      "money back", "investment end", "when will i get capital", "how long", "duration", "term",
      "mudivadaiya", "asal thirumba", "evvalavu naal", "mudivu naal",
      "முதிர்வு", "அசல் திரும்பும்", "திட்ட முடிவு",
      "paripakwa", "pradana mudal", "plan ewa vena",
      "මේරීම", "ප්‍රාග්ධනය ආපසු"],
    answers: {
      en: "📅 **Plan Maturity & Capital Return**\n\nAt the end of your plan term, **your full principal is returned automatically**.\n\n**Example — LKR 5,00,000 · 1-Year Plan:**\n• Monthly profit: LKR 15,000 (3%)\n• 12 months total: LKR 1,80,000\n• At maturity: LKR 5,00,000 returned\n• Grand total: **LKR 6,80,000** ✅\n\n📍 Track your maturity date:\nDashboard → My Investment → **Payout Calendar**",
      ta: "📅 **திட்ட முதிர்வு & அசல் திரும்புதல்**\n\nதிட்ட காலம் முடிவில் **உங்கள் முழு அசலும் தானாக திரும்பும்**.\n\n**உதாரணம் — LKR 5,00,000 · 1 வருட திட்டம்:**\n• மாத லாபம்: LKR 15,000 (3%)\n• 12 மாதங்கள் மொத்தம்: LKR 1,80,000\n• முதிர்வில்: LKR 5,00,000 திரும்பும்\n• மொத்தம்: **LKR 6,80,000** ✅\n\n📍 முதிர்வு தேதி பார்க்க:\nDashboard → My Investment → **Payout Calendar**",
      si: "📅 **සැලසුම් මේරීම & ප්‍රාග්ධනය ආපසු**\n\nකාලය අවසානයේ **සම්පූර්ණ ප්‍රාග්ධනය ස්වයංක්‍රීයව ආපසු**.\n\n**නිදසුන — LKR 5,00,000 · වසර 1:**\n• මාසික: LKR 15,000 (3%)\n• මාස 12: LKR 1,80,000\n• මේරීමේදී: LKR 5,00,000 ආපසු\n• මුළු: **LKR 6,80,000** ✅\n\n📍 මේරීමේ දිනය:\nDashboard → My Investment → **Payout Calendar**",
    },
    quick: ["Investment plans", "Minimum amount", "Withdrawal process", "Contact"],
  },

  profit_destination: {
    phrases: ["wallet or bank", "profit destination", "where does profit go", "direct bank",
      "wallet credit", "escrow", "profit option", "which is better wallet or bank",
      "wallet aa bank aa", "laabam enge pogum", "bank kku poguma",
      "வாலட்டா வங்கியா", "லாபம் எங்கே போகும்",
      "wallet da bank da", "laabaya koheda yana",
      "ලාභය කොහේ යයිද", "Wallet ද Bank ද"],
    answers: {
      en: "🏦 **Profit Destination: Wallet vs Bank**\n\n**💚 WALLET** *(flexible)*\n• Profit auto-credited to Available Balance each month\n• Withdraw anytime or reinvest\n• Visible instantly on dashboard\n\n**🏛️ BANK** *(direct income)*\n• Profit goes to Held Balance (Escrow)\n• Admin confirms & transfers to your bank\n• Processing: 2–3 business days\n• Recorded in Transaction History after confirmation\n\n💡 **Choose WALLET** for flexibility · **Choose BANK** for direct income",
      ta: "🏦 **லாப இலக்கு: வாலட் vs வங்கி**\n\n**💚 WALLET** *(நெகிழ்வு)*\n• ஒவ்வொரு மாதமும் Available Balance ல் தானாக கிரெடிட்\n• எப்போதும் எடுக்கலாம் அல்லது மீண்டும் முதலீடு செய்யலாம்\n• Dashboard ல் உடனடியாக தெரியும்\n\n**🏛️ BANK** *(நேரடி வருமானம்)*\n• லாபம் Held Balance (Escrow) ல் செல்லும்\n• நிர்வாகி வங்கி கணக்கிற்கு பரிமாற்றம் செய்வார்\n• செயலாக்கம்: 2–3 வணிக நாட்கள்\n\n💡 நெகிழ்வுக்கு **WALLET** · நேரடி வங்கி வருமானத்திற்கு **BANK**",
      si: "🏦 **ලාභ ගමනාන්තය: Wallet vs Bank**\n\n**💚 WALLET** *(නම්‍ය)*\n• සෑම මාසයකම Available Balance ට ස්වයංක්‍රීය\n• ඕනෑම වේලාවක ගත හැකිය හෝ නැවත ආයෝජනය\n• Dashboard හි ක්ෂණිකව\n\n**🏛️ BANK** *(සෘජු ආදායම)*\n• Held Balance (Escrow) ට යයි\n• පරිපාලකය ඔබේ බැංකු ගිණුමට මාරු කරනු ලැබේ\n• ව්‍යාපාරික දින 2–3\n\n💡 නම්‍යතාව → **WALLET** · සෘජු ආදායම → **BANK**",
    },
    quick: ["How to invest", "Withdrawal process", "Monthly profit", "Contact"],
  },

  contact: {
    phrases: ["contact", "phone", "call", "email", "address", "location", "where", "hours", "time",
      "helpline", "support", "human", "agent", "reach", "talk to someone", "office",
      "thodarbu", "pesa", "mugavari", "neram", "phone number", "contact pannunga",
      "தொடர்பு", "முகவரி", "நேரம்", "தொலைபேசி",
      "amathanna", "number", "koheda", "welawa", "call karana",
      "අමතන්න", "ලිපිනය", "ස්ථානය", "වේලාව"],
    answers: {
      en: "📞 **Contact NF Plantation**\n\n🏢 **Office:**\nNo: 150, Housing Scheme, Kannakipuram\nKilinochchi, Sri Lanka\n\n📞 **Phone**: 024 4335099\n✉️ **Email**: info@nfplantation.com\n🌐 **Website**: nfplantation.com\n\n⏰ **Hours:**\nMon–Fri: 8:00 AM – 5:00 PM\nSaturday: 10:00 AM – 2:00 PM\nSunday: Closed\n\n💬 WhatsApp available during office hours",
      ta: "📞 **NF Plantation தொடர்பு**\n\n🏢 **அலுவலகம்:**\nNo: 150, Housing Scheme, Kannakipuram\nகிளிநொச்சி, இலங்கை\n\n📞 **தொலைபேசி**: 024 4335099\n✉️ **மின்னஞ்சல்**: info@nfplantation.com\n🌐 **தளம்**: nfplantation.com\n\n⏰ **நேரம்:**\nதிங்கள்–வெள்ளி: 8:00 – 5:00\nசனி: 10:00 – 2:00\nஞாயிறு: மூடப்பட்டிருக்கும்\n\n💬 அலுவலக நேரத்தில் WhatsApp",
      si: "📞 **NF Plantation සම්බන්ධතා**\n\n🏢 **කාර්යාලය:**\nඅංක 150, නිවාස යෝජනා ක්‍රමය, කන්නකිපුරම්\nකිලිනොච්චි, ශ්‍රී ලංකාව\n\n📞 **දුරකථන**: 024 4335099\n✉️ **Email**: info@nfplantation.com\n🌐 **ද්වාරය**: nfplantation.com\n\n⏰ **වේලාවන්:**\nසඳු–සිකු: 8:00 AM – 5:00 PM\nසෙනසුරා: 10:00 AM – 2:00 PM\nඉරිදා: වසා ඇත\n\n💬 කාර්යාල වේලාවලදී WhatsApp",
    },
    quick: ["Investment plans", "Deposit help", "Login problem", "Withdrawal"],
  },

  founder: {
    phrases: ["founder", "ceo", "owner", "boss", "kunatheepan", "who started", "head", "chairman",
      "niruvanar", "thalaivar", "yaar niruvi",
      "நிறுவனர்", "தலைவர்", "குணதீபன்",
      "nirmaatru", "ayithi", "kawuda pittupada",
      "නිර්මාතෘ", "අයිතිකරු", "කවුද"],
    answers: {
      en: "🌿 **Founder**\n\n**Mr. Thiyagarajaj Kunatheepan**\nCEO & Chairman, NF Plantation\n\nFounded **2020** with the vision of:\n• Sustainable agriculture in Northern Sri Lanka\n• Community-powered investment\n• Employment through plantation projects\n\nNF Plantation now serves hundreds of investors across Sri Lanka with consistent monthly returns.",
      ta: "🌿 **நிறுவனர்**\n\n**திரு. தியாகராஜா குணதீபன்**\nCEO & தலைவர், NF Plantation\n\n**2020** ல் நிறுவினார்:\n• வட இலங்கையில் நிலையான விவசாயம்\n• சமூக அதிகாரமளிக்கும் முதலீடு\n• தோட்ட திட்டங்கள் மூலம் வேலை வாய்ப்பு\n\nதலைமையில் NF Plantation நூற்றுக்கணக்கான முதலீட்டாளர்களுக்கு நம்பகமான வருமானம் வழங்குகிறது.",
      si: "🌿 **ආරම්භකයා**\n\n**ත්‍යාගරාජා කුණතීපන් මහතා**\nCEO & සභාපති, NF Plantation\n\n**2020** දී ආරම්භ:\n• උතුරු ශ්‍රී ලංකාවේ තිරසාර කෘෂිකාර්මික\n• ප්‍රජා-බලගැන්වීමේ ආයෝජන\n• වෙල්යාය ව්‍යාපෘති රැකියා\n\nශ්‍රී ලංකාව පුරා ආයෝජකයන් සිය ගණනකට ස්ථාවර ප්‍රතිලාභ.",
    },
    quick: ["Company projects", "Safety", "Investment plans", "Contact"],
  },

  projects: {
    phrases: ["project", "agriculture", "farming", "aloe vera", "coconut", "garment", "textile",
      "what do you do", "business", "operations", "plantation", "sector",
      "vasayam", "vivasaayam", "katralai", "thottam", "aadai", "factory",
      "விவசாயம்", "கற்றாழை", "தேங்காய்", "ஆடை",
      "govithana", "aloe vera", "pol", "garment",
      "ව්‍යාපාර", "කෘෂිකර්මය", "ගාමන්ට්"],
    answers: {
      en: "🌿 **Our Business Projects**\n\n🌵 **Aloe Vera Plantation**\n500+ acres in Kilinochchi. Exports to international cosmetics & pharmaceutical companies.\n\n🥥 **Coconut Cultivation**\nSustainable models benefiting local communities.\n\n👕 **Garment Factory** *(Phase 2)*\nCommunity-funded, employing 500+ local workers.\n\n🌾 **Organic Farming**\nEco-friendly, chemical-free agriculture.\n\n💡 Your investment directly funds these real projects.",
      ta: "🌿 **எமது வணிக திட்டங்கள்**\n\n🌵 **கற்றாழை தோட்டம்**\nகிளிநொச்சியில் 500+ ஏக்கர். சர்வதேச நிறுவனங்களுக்கு ஏற்றுமதி.\n\n🥥 **தேங்காய் பயிர்ச்செய்கை**\nசமூகங்களுக்கு நலன் தரும் நிலையான விவசாயம்.\n\n👕 **ஆடை தொழிற்சாலை** *(நிலை 2)*\nசமூக நிதியுடன் 500+ தொழிலாளர்கள்.\n\n🌾 **இயற்கை விவசாயம்**\nசூழல் நட்பு, வேதிப்பொருள் இல்லாத விவசாயம்.\n\n💡 உங்கள் முதலீடு இந்த திட்டங்களுக்கு நேரடியாக நிதி வழங்குகிறது.",
      si: "🌿 **අපගේ ව්‍යාපෘති**\n\n🌵 **ඇලෝ වේරා වගාව**\nකිලිනොච්චියේ අක්කර 500+. ජාත්‍යන්තර සමාගම් වෙත.\n\n🥥 **පොල් වගාව**\nදේශීය ප්‍රජාවට ප්‍රයෝජනවත්.\n\n👕 **ඇඟලුම් කර්මාන්ත ශාලාව** *(2 වෙනි අදියර)*\nකම්කරුවන් 500+.\n\n🌾 **කාබනික වගාව**\nරසායනික-නිදහස්.\n\n💡 ඔබේ ආයෝජනය සෘජුවම මෙම ව්‍යාපෘතිවලට.",
    },
    quick: ["Investment plans", "Safety", "Founder", "Contact"],
  },

  thanks: {
    phrases: ["thank", "thanks", "thank you", "ok", "okay", "bye", "understood", "great", "perfect", "got it", "clear",
      "nandri", "super", "sari", "purinjuchu", "romba nandri",
      "நன்றி", "சரி", "புரிந்தது",
      "sthuthi", "hari", "bohoma sthuthi", "theruna",
      "ස්තුතියි", "හරි", "හොඳයි"],
    answers: {
      en: "😊 Happy to help!\n\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nSecure your financial future with NF Plantation! 🌿",
      ta: "😊 உதவியதில் மகிழ்ச்சி!\n\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nNF Plantation உடன் எதிர்காலத்தை உறுதிப்படுத்துங்கள்! 🌿",
      si: "😊 ඔබට සහාය කිරීමට ලැබීම සතුටක්!\n\n📞 **024 4335099**\n✉️ **info@nfplantation.com**\n\nNF Plantation සමඟ අනාගතය සුරක්ෂිත! 🌿",
    },
    quick: ["Investment plans", "How to invest", "Contact us"],
  },
};

// ---------------------------------------------------------------------------
// NLP ENGINE  —  phrase match → multi-word boost → fuzzy word fallback
// ---------------------------------------------------------------------------
function editDist(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

function wordSim(w1, w2) {
  const len = Math.max(w1.length, w2.length);
  return len === 0 ? 1 : (len - editDist(w1, w2)) / len;
}

function classifyIntent(text) {
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/).filter((w) => w.length >= 3);
  let best = null, bestScore = 0;

  for (const [name, data] of Object.entries(KB)) {
    let score = 0;
    for (const phrase of data.phrases) {
      const pLower = phrase.toLowerCase();
      if (lower.includes(pLower)) {
        // multi-word phrases score higher
        const boost = pLower.split(/\s+/).length;
        score = Math.max(score, 0.88 + boost * 0.025);
        continue;
      }
      for (const w of words) {
        const s = wordSim(w, pLower);
        if (s > 0.78) score = Math.max(score, s * 0.82);
      }
    }
    if (score > bestScore) { bestScore = score; best = name; }
  }
  return { intent: bestScore > 0.54 ? best : null };
}

function detectLang(text) {
  if (/[஀-௿]/.test(text)) return "ta";
  if (/[඀-෿]/.test(text)) return "si";
  const lower = text.toLowerCase();
  const ta = ["vanakkam", "mudaleedu", "laabam", "nandri", "thodarbu", "evvalavu",
    "pathukaapu", "vatti", "eppadi", "purinjuchu", "panam", "deposit panna", "withdraw panna"];
  const si = ["ayubowan", "kohomada", "sthuthi", "aayojana", "salli", "ganana",
    "amathanna", "hari", "koheda", "thanapathu", "laabaya", "bohoma"];
  if (ta.some((w) => lower.includes(w))) return "ta";
  if (si.some((w) => lower.includes(w))) return "si";
  return "en";
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
const WELCOME = {
  type: "bot",
  text: "👋 Hello! I'm the **NF Plantation** AI Assistant.\n\nI speak **English**, **Tamil (தமிழ்)**, and **Sinhala (සිංහල)**.\nSpelling mistakes? No problem — I still understand!\n\nHow can I help you today?",
  quick: ["Investment plans", "How to invest", "Deposit steps", "Contact"],
};

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 15000);
    return () => clearTimeout(t);
  }, []);

  const respond = (userText) => {
    const lang = detectLang(userText);
    const { intent } = classifyIntent(userText);

    let text, quick;
    if (intent) {
      text = KB[intent].answers[lang];
      quick = KB[intent].quick || [];
    } else {
      const fallback = {
        en: "I'm not sure I understood that. You can ask about:\n• 💰 **Investment plans**\n• 📥 **Deposits / Withdrawals**\n• 🏦 **Wallet & returns**\n• ⚙️ **Account / login**\n• 📞 **Contact details**\n\nOr call us: **024 4335099**",
        ta: "அது எனக்கு புரியவில்லை. இவற்றை கேட்கலாம்:\n• 💰 **முதலீட்டு திட்டங்கள்**\n• 📥 **டிபாசிட் / திரும்பப் பெறுதல்**\n• 🏦 **வாலட் & வருமானம்**\n• ⚙️ **கணக்கு / உள்நுழைவு**\n• 📞 **தொடர்பு விவரங்கள்**\n\nஅல்லது அழைக்கவும்: **024 4335099**",
        si: "මට එය තේරුණේ නැත. ඔබට ඇසිය හැකිය:\n• 💰 **ආයෝජන සැලසුම්**\n• 📥 **තැන්පතු / ආපසු ගැනීම**\n• 🏦 **Wallet & ප්‍රතිලාභ**\n• ⚙️ **ගිණුම / ලොගින්**\n• 📞 **සම්බන්ධතා**\n\nනැතහොත් අමතන්න: **024 4335099**",
      };
      text = fallback[lang];
      quick = ["Investment plans", "Deposit steps", "Contact", "How to invest"];
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text, quick }]);
      setIsTyping(false);
    }, 650 + Math.random() * 350);
  };

  const sendMessage = (text) => {
    const msg = text.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { type: "user", text: msg }]);
    setInput("");
    setIsTyping(true);
    respond(msg);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const renderText = (text) =>
    text.split("\n").map((line, i) => (
      <p key={i} className="min-h-[1.1em]">
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
      </p>
    ));

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-none">

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="mb-4 w-[360px] max-w-[93vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20 overflow-hidden">
                  <img src={BOT_IMG} alt="AI" className="w-full h-full object-cover scale-110" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-emerald-600 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">NF Support AI</h3>
                <p className="text-[10px] text-emerald-100 mt-0.5">English · தமிழ் · සිංහල</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMessages([WELCOME])}
                className="text-emerald-100 hover:text-white transition-colors p-1.5"
                title="Reset"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-emerald-100 hover:text-white transition-colors p-1.5"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto h-[420px] px-4 py-4 bg-gray-50 dark:bg-gray-950/50 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`flex ${msg.type === "user" ? "justify-end" : "justify-start items-end gap-2"}`}>
                  {msg.type === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-emerald-200">
                      <img src={BOT_IMG} alt="Bot" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                    msg.type === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none"
                  }`}>
                    {renderText(msg.text)}
                  </div>
                </div>

                {/* Quick reply chips — only on last bot message */}
                {msg.type === "bot" && msg.quick?.length > 0 && idx === messages.length - 1 && !isTyping && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                    {msg.quick.map((q, qi) => (
                      <button
                        key={qi}
                        onClick={() => sendMessage(q)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 rounded-full hover:bg-emerald-50 hover:border-emerald-400 transition-all active:scale-95"
                      >
                        <ChevronRight size={10} />
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex-shrink-0 overflow-hidden border border-emerald-200">
                  <img src={BOT_IMG} alt="Bot" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask anything… English / Tamil / Sinhala"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder-gray-400 transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-40 transition-all active:scale-95 shadow"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-400 mt-1.5 tracking-wide">
              Powered by NF Plantation AI · Typos are OK
            </p>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {!isOpen && showTooltip && (
        <div className="absolute bottom-16 md:bottom-20 right-0 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-2 whitespace-nowrap pointer-events-auto flex items-center gap-2">
          <p className="text-xs font-black text-gray-800 dark:text-white">Need help? Chat now! 👋</p>
          <button
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white dark:bg-gray-800 border-r border-b border-gray-100 dark:border-gray-700" />
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => { setIsOpen((o) => !o); setShowTooltip(false); }}
        style={{ width: "52px", height: "52px" }}
        className={`rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.45)] flex items-center justify-center transition-all bg-gradient-to-tr from-emerald-600 to-teal-500 text-white pointer-events-auto active:scale-90 duration-300 relative z-50 ${isOpen ? "rotate-90" : "hover:scale-110"}`}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10">
            <img src={BOT_IMG} alt="Chat" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
        )}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-20 animate-ping" />
        )}
      </button>
    </div>
  );
};

export default ChatAssistant;
