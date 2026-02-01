import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from 'context/AuthContext'; // Uvozimo auth da znamo ko je korisnik

export const AnalyticsChart = () => {
  const { user } = useAuth();

  
  const generateData = () => {
    const nameSeed = user?.firstName?.length || 5;
    const days = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
    
    return days.map((day, index) => ({
      dan: day,
      
      aktivnost: Math.floor(((nameSeed * (index + 1)) % 50) + 15)
    }));
  };

  const personalData = generateData();

  return (
    <div style={{ width: '100%', height: 300, background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '10px', color: '#333' }}>
        Statistika tvoje aktivnosti
      </h4>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Analitika poslatih poruka za korisnika: <strong>{user?.firstName}</strong>
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={personalData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dan" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="aktivnost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};