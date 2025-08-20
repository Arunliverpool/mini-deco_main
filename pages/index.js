import Link from 'next/link';


export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Avatar App</h1>
      <div style={{ marginTop: '40px' }}>
        <Link href="/CreateAvatar">
          <button style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            margin: '10px'
          }}>
            Create Avatar
          </button>
        </Link>
        <Link href="/test">
          <button style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#764ba2',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            margin: '10px'
          }}>
            Test Connection
          </button>
        </Link>
      </div>
    </div>
  );
}