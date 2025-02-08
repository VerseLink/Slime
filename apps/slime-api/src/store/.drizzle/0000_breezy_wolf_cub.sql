CREATE TABLE `CommunityCoupon` (
	`couponId` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`userId` text NOT NULL,
	`urlPath` text NOT NULL,
	`hostname` text NOT NULL,
	`code` text NOT NULL,
	`metadata` text,
	`description` text,
	`conditions` text,
	`reportedAt` integer NOT NULL,
	`expireAt` integer,
	CONSTRAINT "type_check" CHECK("CommunityCoupon"."type" in ('coupon', 'redeem'))
);
--> statement-breakpoint
CREATE TABLE `VerifiedCoupon` (
	`couponId` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`code` text NOT NULL,
	`metadata` text,
	`description` text,
	`conditions` text,
	`reportedAt` integer NOT NULL,
	`expireAt` integer,
	CONSTRAINT "type_check" CHECK("VerifiedCoupon"."type" in ('coupon', 'redeem'))
);
--> statement-breakpoint
CREATE INDEX `VerifiedCoupon_expireAt_IDX` ON `VerifiedCoupon` (`expireAt`);