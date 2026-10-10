'use client';

import { useState, useEffect } from 'react';

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'VelnoxLabs Age Calculator',
      'operatingSystem': 'All',
      'applicationCategory': 'UtilityApplication',
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'description': 'Free online age calculator — calculate exact age in years, months, days, hours, minutes, and seconds. Find your next birthday countdown, zodiac sign, and day of week you were born.'
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How is age calculated?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Age is calculated by finding the difference between today\'s date and your date of birth. The tool accounts for leap years, varying month lengths, and gives an exact years/months/days breakdown.' }
        },
        {
          '@type': 'Question',
          'name': 'What is the difference between chronological and biological age?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Chronological age is the actual time elapsed since you were born — that\'s what this calculator measures. Biological age reflects how old your body appears based on health markers, which can differ from chronological age.' }
        },
        {
          '@type': 'Question',
          'name': 'Is my birthdate stored anywhere?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'No. All calculations happen entirely in your browser. Your birthdate is never sent to any server and is never stored.' }
        },
        {
          '@type': 'Question',
          'name': 'Can I use this for official documents?',
          'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, the results are mathematically accurate and can help fill out visa applications, school forms, medical paperwork, and other documents requiring your exact age.' }
        }
      ]
    }
  ]
};

const getZodiacSign = (month: number, day: number): string => {
  const signs = [
    { sign: 'Capricorn', endDate: 19 },   // Jan
    { sign: 'Aquarius', endDate: 18 },    // Feb
    { sign: 'Pisces', endDate: 20 },      // Mar
    { sign: 'Aries', endDate: 19 },       // Apr
    { sign: 'Taurus', endDate: 20 },      // May
    { sign: 'Gemini', endDate: 20 },      // Jun
    { sign: 'Cancer', endDate: 22 },      // Jul
    { sign: 'Leo', endDate: 22 },         // Aug
    { sign: 'Virgo', endDate: 22 },       // Sep
    { sign: 'Libra', endDate: 22 },       // Oct
    { sign: 'Scorpio', endDate: 21 },     // Nov
    { sign: 'Sagittarius', endDate: 21 }, // Dec
  ];
  if (month === 1) return day <= 19 ? 'Capricorn' : 'Aquarius';
  const signIndex = month - 1;
  return day <= signs[signIndex].endDate ? signs[signIndex].sign : signs[(signIndex + 1) % 12].sign;
};

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!birthDate) {
      setResult(null);
      return;
    }

    const dob = new Date(birthDate);
    const today = new Date();

    if (dob > today) {
      setError('Birth date cannot be in the future.');
      setResult(null);
      return;
    }
    setError('');

    // Exact Age Calculation (Y/M/D)
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }

    // Total Stats Calculation
    const diffTime = Math.abs(today.getTime() - dob.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffTime / (1000 * 60));

    // Next Birthday
    let nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const nextBirthdayDiff = Math.abs(nextBirthday.getTime() - today.getTime());
    const daysToBirthday = Math.ceil(nextBirthdayDiff / (1000 * 60 * 60 * 24));

    setResult({
      years, months, days,
      totalMonths, totalWeeks, totalDays, totalHours, totalMinutes,
      dayOfWeek: dob.toLocaleDateString('en-US', { weekday: 'long' }),
      zodiac: getZodiacSign(dob.getMonth() + 1, dob.getDate()),
      daysToBirthday
    });
  }, [birthDate]);

  const copyReport = () => {
    if (!result) return;
    const text = `Age Report:\nExact Age: ${result.years} years, ${result.months} months, ${result.days} days\nBorn on: ${result.dayOfWeek}\nZodiac Sign: ${result.zodiac}\nNext Birthday: In ${result.daysToBirthday} days\nTotal Months: ${result.totalMonths.toLocaleString()}\nTotal Weeks: ${result.totalWeeks.toLocaleString()}\nTotal Days: ${result.totalDays.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    alert('Report copied to clipboard!');
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      
      <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Age Calculator</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Calculate your exact age in years, months, days, hours, and minutes — plus next birthday countdown and zodiac sign.
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
            <label htmlFor="dob" className="block text-sm font-semibold text-slate-300 mb-2">
              Date of Birth:
            </label>
            <input
              type="date"
              id="dob"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors [color-scheme:dark]"
            />
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Exact Age Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                <h2 className="text-sm uppercase tracking-widest font-bold text-emerald-400 mb-4">Your Exact Age</h2>
                <div className="flex flex-wrap justify-center items-baseline gap-2 md:gap-4 text-white">
                  <span className="text-6xl md:text-7xl font-extrabold">{result.years}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">years</span>
                  <span className="text-6xl md:text-7xl font-extrabold">{result.months}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">months</span>
                  <span className="text-6xl md:text-7xl font-extrabold">{result.days}</span>
                  <span className="text-xl md:text-2xl text-slate-400 font-medium">days</span>
                </div>
                <button 
                  onClick={copyReport}
                  className="mt-8 bg-slate-800 hover:bg-slate-700 text-blue-400 font-medium py-3 px-6 rounded-lg transition-colors border border-slate-700"
                >
                  Copy Full Report
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Months', value: result.totalMonths.toLocaleString() },
                  { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                  { label: 'Total Days', value: result.totalDays.toLocaleString() },
                  { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                  { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
                  { label: 'Days to Birthday', value: result.daysToBirthday.toLocaleString() },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-emerald-400">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Secondary Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">🎂 BORN ON</p>
                  <p className="text-2xl font-bold text-white">{result.dayOfWeek}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">♊ ZODIAC SIGN</p>
                  <p className="text-2xl font-bold text-white">{result.zodiac}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-sm text-slate-400 mb-1">📅 NEXT BIRTHDAY</p>
                  <p className="text-2xl font-bold text-white">In {result.daysToBirthday} days</p>
                </div>
              </div>
            </div>
          )}

          {/* SEO & Info Section */}
          <div className="mt-16 space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">What is an Age Calculator?</h2>
              <p className="text-slate-400 leading-relaxed">
                An Age Calculator is a free online tool that calculates your exact age from your date of birth. Unlike a simple year-difference, this tool gives you a precise breakdown in years, months, days, hours, minutes, and even total weeks. It also shows you the day of the week you were born, your zodiac sign, and how many days are left until your next birthday. Perfect for filling out forms, legal documents, visa applications, or just satisfying curiosity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How to Use This Tool</h2>
              <ol className="list-decimal pl-6 text-slate-400 space-y-2">
                <li>Select your date of birth using the date picker.</li>
                <li>Your exact age appears instantly in years, months, and days.</li>
                <li>View total time lived in months, weeks, days, hours, and minutes.</li>
                <li>See your zodiac sign, day of the week born, and next birthday countdown.</li>
                <li>Click <strong className="text-emerald-400">Copy Full Report</strong> to save or share.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {schemaData['@graph'][1].mainEntity.map((faq, index) => (
                  <div key={index} className="border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">{faq.name}</h3>
                    <p className="text-slate-400 leading-relaxed">{faq.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Feedback Section */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Got Feedback or Feature Requests?</h2>
              <p className="text-slate-400 mb-6">Help us enhance VelnoxLabs developer utility standards. Share your feedback below!</p>
              <textarea 
                rows={4}
                placeholder="Write your suggestions or feature requests here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors mb-4 resize-y"
              ></textarea>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Submit Suggestion
              </button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}