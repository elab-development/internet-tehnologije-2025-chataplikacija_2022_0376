'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

interface HourlyData {
  sat: string;
  poruke: number;
}

interface DailyData {
  dan: string;
  poruke: number;
}

interface UserStats {
  totalMessages: number;
  avgPerDay: number;
  mostActiveHour: string;
  favoriteDay: string;
}

// ============ GLAVNA KOMPONENTA ============
export const AnalyticsChart = () => {
  const { user } = useAuth();
  const [chartType, setChartType] = useState<'hourly' | 'daily'>('hourly');
  
  // ============ GENERISANJE PODATAKA ============
  const seed = user?.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 12345;
  
  // Generiši podatke po satima (0-23)
  const hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, i) => {

    let baseValue = 0;
    
    if (i >= 0 && i < 6) baseValue = 2; // Noć
    else if (i >= 6 && i < 9) baseValue = 8; // Jutro
    else if (i >= 9 && i < 12) baseValue = 15; // Pre podne
    else if (i >= 12 && i < 17) baseValue = 12; // Posle podne
    else if (i >= 17 && i < 20) baseValue = 20; // Veče
    else baseValue = 25; // Kasno veče
    
    const variation = ((seed * (i + 1)) % 10) - 5;
    const value = Math.max(0, baseValue + variation);
    
    return {
      sat: `${i.toString().padStart(2, '0')}:00`,
      poruke: Math.round(value)
    };
  });

  // Generiši podatke po danima u nedelji
  const dailyData: DailyData[] = [
    { dan: 'Pon', poruke: 45 + (seed % 20) },
    { dan: 'Uto', poruke: 38 + (seed % 15) },
    { dan: 'Sre', poruke: 52 + (seed % 25) },
    { dan: 'Čet', poruke: 41 + (seed % 18) },
    { dan: 'Pet', poruke: 67 + (seed % 30) },
    { dan: 'Sub', poruke: 89 + (seed % 35) },
    { dan: 'Ned', poruke: 73 + (seed % 28) }
  ];

  // Izračunaj statistiku
  const stats: UserStats = {
    totalMessages: hourlyData.reduce((sum, h) => sum + h.poruke, 0),
    avgPerDay: Math.round(hourlyData.reduce((sum, h) => sum + h.poruke, 0) / 7),
    mostActiveHour: hourlyData.reduce((max, curr) => 
      curr.poruke > max.poruke ? curr : max
    ).sat,
    favoriteDay: dailyData.reduce((max, curr) => 
      curr.poruke > max.poruke ? curr : max
    ).dan
  };

  // ============ RENDER ============
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full">
      {/* Header sa korisničkim info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            📊 Tvoja aktivnost
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {user?.firstName ? `Zdravo, ${user.firstName}! ` : ''}
            Pregled tvojih poruka u poslednjih 7 dana
          </p>
        </div>
        
        {/* Toggle dugmad za tip grafikona */}
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <button
            onClick={() => setChartType('hourly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              chartType === 'hourly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⏰ Po satima
          </button>
          <button
            onClick={() => setChartType('daily')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              chartType === 'daily'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📅 Po danima
          </button>
        </div>
      </div>

      {/* Glavni grafikon */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'hourly' ? (
            <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoruke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="sat" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval={2}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ 
                  value: 'Broj poruka', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
              />
              <Area 
                type="monotone" 
                dataKey="poruke" 
                stroke="#4f46e5" 
                fill="url(#colorPoruke)"
                strokeWidth={2}
                name="Poruke"
              />
            </AreaChart>
          ) : (
            <BarChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dan" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ 
                  value: 'Broj poruka', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: '#6b7280', fontSize: 12 }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="poruke" 
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]}
                name="Poruke"
              >
                {dailyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.dan === stats.favoriteDay ? '#ef4444' : '#4f46e5'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Statistički sažetak */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Ukupno poruka</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
          <p className="text-xs text-gray-400 mt-1">u poslednjih 7 dana</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Prosek dnevno</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgPerDay}</p>
          <p className="text-xs text-gray-400 mt-1">poruka dnevno</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Najaktivniji sat</p>
          <p className="text-2xl font-bold text-blue-600">{stats.mostActiveHour}</p>
          <p className="text-xs text-gray-400 mt-1">najviše poruka</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Omiljeni dan</p>
          <p className="text-2xl font-bold text-blue-600">{stats.favoriteDay}</p>
          <p className="text-xs text-gray-400 mt-1">najaktivniji</p>
        </div>
      </div>

      {/* Insights poruka */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">✨ Insight: </span>
          Najviše poruka šalješ u <strong>{stats.mostActiveHour}</strong> časova, 
          a najaktivniji dan ti je <strong>{stats.favoriteDay}</strong>. 
          {stats.mostActiveHour >= '18:00' && stats.mostActiveHour <= '23:00' ? 
            ' Izgleda si večernji tip! 🌙' : 
            ' Jutarnji si tip! ☀️'}
        </p>
      </div>
    </div>
  );
};