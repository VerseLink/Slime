CREATE TABLE `JwtId` (
	`jti` text PRIMARY KEY NOT NULL,
	`initJti` text NOT NULL,
	`fromJti` text,
	`issuedAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`metadata` text,
	FOREIGN KEY (`fromJti`) REFERENCES `JwtId`(`jti`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `JwtId_fromJti_idx` ON `JwtId` (`fromJti`);--> statement-breakpoint
CREATE INDEX `JwtId_initJti_idx` ON `JwtId` (`initJti`);--> statement-breakpoint
CREATE INDEX `JwtId_expireAt_idx` ON `JwtId` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `ServiceClaims` (
	`service` text PRIMARY KEY NOT NULL,
	`claims` text
);
