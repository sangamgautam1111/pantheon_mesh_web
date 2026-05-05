'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';

export default function BusinessCommissionPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Dynamic data from URL or defaults
    const needTitle = searchParams.get('title') || 'Service Request';
    const rawPrice = searchParams.get('price') || '2500';
    const repairPrice = parseInt(rawPrice.replace(/\D/g, '')) || 2500;
    const commissionRate = 0.05; // 5%
    const commissionAmount = Math.ceil(repairPrice * commissionRate);

    // eSewa requires transaction_uuid to be unique per request.
    const transactionUuid = `NDR-${Date.now()}`;

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Fetch the HMAC SHA256 Signature from our Next.js backend
            const res = await fetch('/api/esewa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total_amount: commissionAmount,
                    transaction_uuid: transactionUuid,
                    product_code: 'EPAYTEST' // Sandbox product code
                })
            });

            const data = await res.json();

            if (data.signature) {
                // 2. Create a form dynamically and submit it to eSewa Sandbox
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

                const inputs = {
                    amount: commissionAmount.toString(),
                    tax_amount: '0',
                    total_amount: commissionAmount.toString(),
                    transaction_uuid: transactionUuid,
                    product_code: 'EPAYTEST',
                    product_service_charge: '0',
                    product_delivery_charge: '0',
                    success_url: `${window.location.origin}/business/commission/success`,
                    failure_url: `${window.location.origin}/business/commission/failure`,
                    signed_field_names: data.signed_field_names,
                    signature: data.signature,
                };

                for (const [key, value] of Object.entries(inputs)) {
                    const hiddenField = document.createElement('input');
                    hiddenField.type = 'hidden';
                    hiddenField.name = key;
                    hiddenField.value = value;
                    form.appendChild(hiddenField);
                }

                document.body.appendChild(form);
                form.submit();
            } else {
                alert('Failed to generate secure signature for payment.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment initiation failed', error);
            alert('Something went wrong initiating payment.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Fee</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        The service is completed. Please pay the platform fee to settle this lead and keep your account active.
                    </p>
                </div>

                <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600 font-medium">Service</span>
                        <span className="text-gray-900 font-semibold truncate ml-4" title={needTitle}>{needTitle}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Total Price</span>
                        <span className="text-gray-900 font-medium">NPR {repairPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                        <span className="text-gray-600">Needero Fee (5%)</span>
                        <span className="text-emerald-600 font-bold">NPR {commissionAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3 mt-2">
                        <span className="text-gray-900 font-bold text-lg">Total Due</span>
                        <span className="text-gray-900 font-bold text-lg">NPR {commissionAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-sm text-white bg-[#60BB46] hover:bg-[#52a33c] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Redirecting...' : 'Pay with eSewa'}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>Secure payment gateway powered by eSewa.</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
