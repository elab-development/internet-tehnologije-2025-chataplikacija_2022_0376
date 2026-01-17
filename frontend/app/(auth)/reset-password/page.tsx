'use client';

import React, { Suspense } from 'react';
import ResetPasswordForm from 'components/forms/ResetPassword';

// Loading komponenta
function LoadingSpinner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <svg 
                style={{ width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} 
                fill="none" 
                viewBox="0 0 24 24"
            >
                <circle 
                    style={{ opacity: 0.25 }} 
                    cx="12" cy="12" r="10" 
                    stroke="#2563eb" 
                    strokeWidth="4"
                />
                <path 
                    style={{ opacity: 0.75 }} 
                    fill="#2563eb" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <ResetPasswordForm />
        </Suspense>
    );
}