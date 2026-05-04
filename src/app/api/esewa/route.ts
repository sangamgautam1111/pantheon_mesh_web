import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { total_amount, transaction_uuid, product_code } = body;

        if (!total_amount || !transaction_uuid || !product_code) {
            return Response.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // According to eSewa docs, the message should be exactly:
        // total_amount=100,transaction_uuid=11-201-13,product_code=EPAYTEST
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        // For UAT (Testing), SecretKey is "8gBm/:&EnhH.1/q"
        const secret = "8gBm/:&EnhH.1/q"; 

        const hash = crypto.createHmac('sha256', secret)
                           .update(message)
                           .digest('base64');

        return Response.json({ 
            signature: hash, 
            signed_field_names: "total_amount,transaction_uuid,product_code" 
        });
    } catch (e) {
        console.error("eSewa Signature Error", e);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
