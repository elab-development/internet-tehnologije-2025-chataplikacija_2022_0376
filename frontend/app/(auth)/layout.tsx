import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #dbeafe)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
              marginBottom: '16px'
            }}
          >
            <svg 
              style={{ width: '32px', height: '32px', color: 'white' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Chat App
          </h1>
          <p style={{ color: '#6b7280' }}>Povežite se sa prijateljima u realnom vremenu</p>
        </div>

        {/* Form Card */}
        <div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            padding: '32px',
            border: '1px solid #f3f4f6'
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
          © 2026 Chat App. Sva prava zadržana.
        </p>
      </div>
    </div>
  );
}