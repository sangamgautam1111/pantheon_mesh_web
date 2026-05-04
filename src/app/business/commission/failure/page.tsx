'use client';

import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CommissionFailurePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Failed</h2>
                <p className="mt-2 text-md text-gray-500">
                    Your eSewa payment could not be processed or was cancelled. Please try again to unlock your next leads.
                </p>

                <div className="mt-8 space-y-4">
                    <Link href="/business/commission" className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm text-white bg-[#60BB46] hover:bg-[#52a33c] transition-colors">
                        Try Again
                    </Link>
                    <Link href="/business/dashboard" className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-gray-300 text-lg font-bold rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        Cancel for now
                    </Link>
                </div>

            </div>
        </div>
    );
}
