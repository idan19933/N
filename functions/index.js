const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);
const cors = require('cors')({origin: true});

admin.initializeApp();

// Create Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated'
        );
    }

    const { courseId, courseName, amount, userId, origin } = data;

    try {
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: courseName,
                            description: `Purchase of ${courseName}`,
                        },
                        unit_amount: amount, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment-cancel`,
            metadata: {
                courseId,
                userId,
            },
        });

        return {
            sessionId: session.id,
            url: session.url  // Return the checkout URL
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Stripe Webhook
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = functions.config().stripe.webhook_secret;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            try {
                await admin.firestore().collection('purchases').add({
                    userId: session.metadata.userId,
                    courseId: session.metadata.courseId,
                    amount: session.amount_total / 100,
                    status: 'completed',
                    paymentIntentId: session.payment_intent,
                    stripeSessionId: session.id,
                    purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                console.log('Purchase recorded successfully');
            } catch (error) {
                console.error('Error recording purchase:', error);
            }
        }

        res.json({ received: true });
    });
});

// Verify payment
exports.verifyPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated'
        );
    }

    const { sessionId } = data;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            return {
                success: true,
                courseId: session.metadata.courseId,
            };
        } else {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Payment not completed'
            );
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});