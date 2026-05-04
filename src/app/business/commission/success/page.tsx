'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CommissionSuccessPage() {
    const searchParams = useSearchParams();
    const encodedData = searchParams.get('data');
    
    // You would typically verify the Base64 response signature against your backend here.
    // For MVP, we show success based on eSewa redirecting here.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Successful</h2>
                <p className="mt-2 text-md text-gray-500">
                    Thank you for paying the Needero platform commission. Your account is in good standing and ready for new local repair leads!
                </p>

                <div className="mt-8">
                    <Link href="/business/dashboard" className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm text-white bg-black hover:bg-gray-800 transition-colors">
                        Return to Dashboard
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
