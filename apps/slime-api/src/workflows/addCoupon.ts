import { AddCoupon } from '@/store/coupon';
import { User } from '@/user';
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep, WorkflowStepConfig } from 'cloudflare:workers';

export interface AddCouponWorkflowParams {
    user: User;
    storeId: string;
    addCoupon: AddCoupon;
}

const config = {
    retries: {
        limit: 10,
        delay: 250,
        backoff: "exponential"
    }
} satisfies WorkflowStepConfig;

export class AddCouponWorkflow extends WorkflowEntrypoint<Env, AddCouponWorkflowParams> {

	async run(event: WorkflowEvent<AddCouponWorkflowParams>, step: WorkflowStep) {
        await step.do("Filter coupon", async () => {

        });

        await step.do("Add coupon to store", async() => {

        });
	}

}
