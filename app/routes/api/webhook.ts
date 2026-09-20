import { purchases } from '~/lib/schema'
import { ActionFunctionArgs, data } from 'react-router'
import Stripe from 'stripe'
import { db } from '~/lib/db.server'
import { stripe } from '~/lib/stripe'

export async function action(args: ActionFunctionArgs) {
  const body = await args.request.text()
  const signature = args.request.headers.get('Stripe-Signature') as string
  console.log('Webhook received', body)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    )
  } catch (error) {
    console.error('Webhook signature verification failed', error)
    return data(
      {
        error: 'Webhook signature verification failed',
      },
      { status: 400 },
    )
  }

  const session = event.data.object as Stripe.Checkout.Session
  const userId = session?.metadata?.userId
  const courseId = session?.metadata?.courseId

  if (event.type === 'checkout.session.completed') {
    if (!userId || !courseId) {
      console.error('User ID or course ID is missing')
      return data({ error: 'User ID or course ID is missing' }, { status: 400 })
    }

    await (
      await db
        .insert(purchases)
        .values({
          userId,
          courseId,
        })
        .returning()
    )[0]
  } else {
    console.error('Unsupported event type', event.type)
    return data({ error: 'Unsupported event type' }, { status: 200 })
  }

  return data({ message: 'Webhook received' }, { status: 200 })
}
