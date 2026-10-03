import { IsIn, Matches } from 'class-validator'
import { PAYMENT_MONTHS, type PaymentMonths } from '../billing'

/** POST /super-admin/restaurants/:id/payments */
export class CreatePaymentDto {
  /** The day the paid period starts — today, in the past or in the future. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'paidAt must be YYYY-MM-DD' })
  paidAt!: string

  @IsIn([...PAYMENT_MONTHS])
  months!: PaymentMonths
}
