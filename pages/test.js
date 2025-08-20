import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Test() {
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test if we can query the table
        const { data, error } = await supabase
          .from('user_avatars')
          .select('count');
          
        if (error) {
          setError(error.message);
        } else {
          setSupabaseConnected(true);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Supabase Status:</h3>
        {supabaseConnected ? (
          <p>✅ Connected successfully!</p>
        ) : error ? (
          <p>❌ Error: {error}</p>
        ) : (
          <p>🔄 Testing connection...</p>
        )}
      </div>

      <div>
        <h3>Ready Player Me Test:</h3>
        <iframe 
          src="https://demo.readyplayer.me/avatar?frameApi" 
          width="400" 
          height="500"
          style={{border: '1px solid #ccc', borderRadius: '8px'}}
        />
        <p>If you see the avatar creator above, Ready Player Me is working! 🎉</p>
      </div>
    </div>
  );
}