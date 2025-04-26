import { Stripe } from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { name, email, amount, paymentMethod } = await request.json();
    if (!name || !email || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400
        }
      )
    }
    let customer;
    const doesCustomerExist = await stripe.customers.list({
      email
    })
    if (doesCustomerExist.data.length > 0) {
      customer = doesCustomerExist.data[0]
    } else {
      const newCustomer = await stripe.customers.create({
        name, email
      });
      customer = newCustomer
    }
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id }, { apiVersion: "2024-06-20" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount) * 100,
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethod,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      }
    });
    console.log(ephemeralKey, customer.id);
    return Response.json({
      paymentIntent,
      ephemeralKey,
      customer: customer.id
    }, { status: 200 })
  } catch (error: any) {
    console.log(error);
    return Response.json({ error }, { status: 500 })

  }
}

