import { getAuth } from '@clerk/react-router/server'
import { ActionFunctionArgs, json } from 'react-router';
import { jsonWithError, jsonWithSuccess } from 'remix-toast'
import { getUserEmail } from '~/lib/clerk.server'
import { db } from '~/lib/db.server'
import { isWhitelistedUser } from '~/lib/user-role.server'

export async function action(args: ActionFunctionArgs) {
  try {
    const { userId } = await getAuth(args)

    if (!userId) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = args.params

    if (!courseId) {
      return json({ error: 'Course ID is required' }, { status: 400 })
    }

    const userEmail = await getUserEmail(userId)

    if (!userEmail || !isWhitelistedUser(userEmail)) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    })

    if (!course) {
      return json({ error: 'Course not found' }, { status: 404 })
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (purchase) {
      return jsonWithError(
        { ok: false },
        { message: 'Purchase already exists' },
        { status: 400 },
      )
    }

    await db.purchase.create({
      data: {
        userId,
        courseId,
      },
    })

    return jsonWithSuccess({ ok: true }, { message: 'Enrolled in course 🎉' })

    // const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    //   {
    //     quantity: 1,
    //     price_data: {
    //       currency: 'USD',
    //       product_data: {
    //         name: course.title,
    //         description: course.description!,
    //       },
    //       unit_amount: Math.round(course.price! * 100),
    //     },
    //   },
    // ]

    // let stripeCustomer = await db.stripeCustomer.findUnique({
    //   where: {
    //     userId,
    //   },
    //   select: {
    //     stripeCustomerId: true,
    //   },
    // })

    // if (!stripeCustomer) {
    //   const customer = await stripe.customers.create({
    //     email: user.emailAddresses[0].emailAddress,
    //   })

    //   stripeCustomer = await db.stripeCustomer.create({
    //     data: {
    //       userId,
    //       stripeCustomerId: customer.id,
    //     },
    //   })
    // }

    // const stripeSession = await stripe.checkout.sessions.create({
    //   customer: stripeCustomer.stripeCustomerId,
    //   mode: 'payment',
    //   line_items,
    //   success_url: `${process.env.REMIX_APP_URL}/courses/${course.id}?success=true`,
    //   cancel_url: `${process.env.REMIX_APP_URL}/courses/${course.id}?success=false`,
    //   metadata: {
    //     courseId,
    //     userId,
    //   },
    // })

    // return json({ url: stripeSession.url }, { status: 200 })
  } catch (error) {
    console.error('[COURSE_ID_CHECKOUT]', error)
    return json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
