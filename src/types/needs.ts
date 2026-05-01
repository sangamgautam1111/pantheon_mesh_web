/**
 * Need Schema for the "Demand-Driven" Marketplace
 * This defines how a "Need" is stored in Firebase.
 */

export interface UserNeed {
    id?: string;
    uid: string;              // Customer who posted
    title: string;            // Short summary (e.g., "iPhone screen repair")
    description: string;      // Detailed requirement
    category: string;         // MVP: "Phone Repair"
    budget?: number;          // Optional: Customer's target price
    
    // Location Data (Using the system we built!)
    location: {
        address: string;
        coords: {
            lat: number;
            lng: number;
        };
        city: string;
        area: string;
    };

    status: 'open' | 'assigned' | 'completed' | 'cancelled';
    createdAt: number;
    expiresAt: number;        // Needs usually expire in 24-48 hours
    
    bidCount: number;         // Track how many businesses "PostRated" this
}

export interface NeedBid {
    bidId: string;
    needId: string;
    businessUid: string;      // Business who is bidding
    amount: number;           // Their price
    message: string;          // Their proposal
    estimatedTime: string;    // How fast they can do it
    createdAt: number;
}
