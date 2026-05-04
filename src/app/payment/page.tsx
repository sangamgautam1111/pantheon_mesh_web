"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Info, ShieldCheck, CreditCard, Send } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { toast } from "react-hot-toast";

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const needId = searchParams.get("needId");
    const quoteId = searchParams.get("quoteId");

    const [selectedMethod, setSelectedMethod] = useState<"esewa" | "khalti">("esewa");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!needId || !quoteId) {
            router.push("/messages");
        }
    }, [needId, quoteId, router]);

    const handleConfirmPayment = () => {
        setIsProcessing(true);
        // Simulate processing time
        setTimeout(() => {
            toast.success("Payment confirmed. Order placed!");
            // Redirect back to messages, setting order=1 to indicate booking started
            router.push(`/messages?needId=${needId}&quoteId=${quoteId}&order=1`);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#f7f7f7] text-[#222325]">
            <header className="border-b border-[#e4e5e7] bg-white px-6 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-[#f7f7f7]">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black">Secure Checkout</h1>
                    </div>
                    <div className="hidden items-center gap-2 text-sm font-semibold text-[#0a8f45] sm:flex">
                        <ShieldCheck size={18} />
                        100% Secure Payment
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    <div className="space-y-6">
                        {/* Payment Method Selection */}
                        <section className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black">Select Payment Method</h2>
                            <p className="mt-1 text-sm font-semibold text-[#74767e]">Choose how you want to pay</p>
                            
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <button
                                    onClick={() => setSelectedMethod("esewa")}
                                    className={`relative flex items-center justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all ${
                                        selectedMethod === "esewa" ? "border-[#60bb46] bg-[#60bb46]/5" : "border-[#e4e5e7] hover:border-[#dadbdd]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                                            <img src="/logos/esewa.png" alt="eSewa" className="h-full w-full object-contain" />
                                        </div>
                                        <span className="font-black">eSewa</span>
                                    </div>
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === "esewa" ? "border-[#60bb46] bg-[#60bb46]" : "border-[#dadbdd]"}`}>
                                        {selectedMethod === "esewa" && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod("khalti")}
                                    className={`relative flex items-center justify-between overflow-hidden rounded-2xl border-2 p-4 transition-all ${
                                        selectedMethod === "khalti" ? "border-[#5c2d91] bg-[#5c2d91]/5" : "border-[#e4e5e7] hover:border-[#dadbdd]"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                                            <img src="/logos/khalti.png" alt="Khalti" className="h-full w-full object-contain" />
                                        </div>
                                        <span className="font-black">Khalti</span>
                                    </div>
                                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selectedMethod === "khalti" ? "border-[#5c2d91] bg-[#5c2d91]" : "border-[#dadbdd]"}`}>
                                        {selectedMethod === "khalti" && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* Payment Details */}
                        <section className="rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black">Scan & Pay</h2>
                            <p className="mt-1 text-sm font-semibold text-[#74767e]">
                                Open your {selectedMethod === "esewa" ? "eSewa" : "Khalti"} app and scan the QR code to complete the payment.
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#dadbdd] bg-[#fbfbfb] p-8">
                                <div className="mb-4 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-[#74767e]">Scan via</p>
                                    <p className={`mt-1 text-2xl font-black ${selectedMethod === "esewa" ? "text-[#60bb46]" : "text-[#5c2d91]"}`}>
                                        {selectedMethod === "esewa" ? "eSewa App" : "Khalti App"}
                                    </p>
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-[#e4e5e7] bg-white shadow-md">
                                    {selectedMethod === "esewa" ? (
                                        <img src="/payment_gateways/nepal_payment_partners/esewa.jpg" alt="eSewa QR Code" className="h-64 w-64 object-cover" />
                                    ) : (
                                        <img src="/payment_gateways/nepal_payment_partners/khalti_partner.jpg" alt="Khalti QR Code" className="h-64 w-64 object-cover" />
                                    )}
                                </div>
                                <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#62646a]">
                                    <Info size={16} className="text-[#0a8f45]" />
                                    Please ensure the amount matches the offer price precisely.
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[#e4e5e7]">
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessing}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a8f45] px-6 py-4 text-base font-black text-white shadow-lg shadow-[#0a8f45]/20 transition-all hover:bg-[#078a3e] hover:shadow-xl hover:shadow-[#0a8f45]/30 active:scale-[0.98] disabled:opacity-70"
                                >
                                    {isProcessing ? "Processing..." : "I have sent the payment"}
                                    {!isProcessing && <Send size={18} />}
                                </button>
                                <p className="mt-3 text-center text-xs font-semibold text-[#74767e]">
                                    By clicking confirm, you agree that you have successfully transferred the funds.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        <aside className="sticky top-24 rounded-2xl border border-[#e4e5e7] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-black">Summary</h2>
                            <div className="mt-6 space-y-4 text-sm font-semibold text-[#62646a]">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-black text-[#222325]">Offer Price</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span className="font-black text-[#222325]">Rs. 0.00</span>
                                </div>
                            </div>
                            <div className="my-6 border-t border-[#e4e5e7]" />
                            <div className="flex items-center justify-between">
                                <span className="font-black text-[#222325]">Total</span>
                                <span className="text-xl font-black text-[#0a8f45]">As per Quote</span>
                            </div>

                            <div className="mt-8 rounded-xl bg-[#f7faf8] p-4">
                                <p className="flex items-center gap-2 text-xs font-black text-[#0a8f45]">
                                    <ShieldCheck size={16} />
                                    Payment Protection
                                </p>
                                <p className="mt-2 text-xs font-semibold leading-5 text-[#64748b]">
                                    Your payment is held securely. When the offer is complete, confirm the offer to release the payment to the local shop. If you don't confirm within 3 days, it gets automatically transferred.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function PaymentPage() {
    return (
        <RouteGuard allowedTypes={["customer"]}>
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center font-black">Loading checkout...</div>}>
                <PaymentContent />
            </Suspense>
        </RouteGuard>
    );
}
