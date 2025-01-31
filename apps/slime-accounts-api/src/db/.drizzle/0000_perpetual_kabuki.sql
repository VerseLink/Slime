CREATE TABLE `UserOAuth` (
	`rowId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`issuer` text NOT NULL,
	`issuedId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `UserId`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `UserOAuth_INDEX_userId` ON `UserOAuth` (`userId`);--> statement-breakpoint
CREATE INDEX `UserOAuth_INDEX_issuedId` ON `UserOAuth` (`issuedId`);--> statement-breakpoint
CREATE UNIQUE INDEX `UserOAuth_INDEX_issuer_issuedId` ON `UserOAuth` (`issuer`,`issuedId`);--> statement-breakpoint
CREATE TABLE `UserId` (
	`userId` text PRIMARY KEY NOT NULL
);
