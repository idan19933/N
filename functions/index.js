const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    try {
        console.log('Creating checkout session with data:', data);

        const { courseId, amount, userId, origin } = data;

        if (!context.auth && !userId) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
        }

        const uid = context.auth?.uid || userId;

        // Get course details
        const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Course not found');
        }

        const courseData = courseDoc.data();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: courseData.title,
                            description: courseData.description,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
            cancel_url: `${origin}/payment-cancel`,
            client_reference_id: uid,
            metadata: {
                courseId: courseId,
                userId: uid,
                amount: amount.toString()
            }
        });

        console.log('Checkout session created:', session.id);
        return { url: session.url };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Webhook to handle successful payments
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Payment successful:', session.id);
        console.log('Metadata:', session.metadata);

        const { courseId, userId, amount } = session.metadata;

        try {
            // Save purchase to Firestore
            await admin.firestore().collection('purchases').add({
                userId: userId,
                courseId: courseId,
                amount: parseFloat(amount),
                status: 'completed',
                sessionId: session.id,
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentIntent: session.payment_intent
            });

            console.log('Purchase saved to Firestore');
        } catch (error) {
            console.error('Error saving purchase:', error);
        }
    }

    res.json({ received: true });
});