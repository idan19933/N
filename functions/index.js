const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    try {
        const { courseId, amount, userId, origin, codeId } = data;

        console.log('Creating checkout session:', { courseId, amount, userId });

        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        // ✅ הוסף את courseId ל-success URL!
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'ils', // ✅ שקלים
                        product_data: {
                            name: `Course: ${courseId}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // ✅ הוסף courseId ל-URL!
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
            cancel_url: `${origin}/payment-cancel?courseId=${courseId}`,
            client_reference_id: userId,
            metadata: {
                courseId: courseId,
                userId: userId,
                codeId: codeId || ''
            },
        });

        console.log('✅ Session created:', session.id);

        return {
            success: true,
            url: session.url,
            sessionId: session.id
        };

    } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Webhook לטיפול בתשלום מוצלח
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('✅ Payment successful:', session.id);

        // שמור רכישה ב-Firestore
        try {
            await admin.firestore().collection('purchases').add({
                userId: session.client_reference_id,
                courseId: session.metadata.courseId,
                amount: session.amount_total / 100,
                currency: 'ILS',
                status: 'completed',
                purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                sessionId: session.id,
                paymentMethod: 'stripe',
                codeId: session.metadata.codeId || null
            });

            console.log('✅ Purchase recorded in Firestore');
        } catch (error) {
            console.error('❌ Error saving purchase:', error);
        }
    }

    res.json({ received: true });
});