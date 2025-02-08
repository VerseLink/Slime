CREATE TABLE `SubmittedCode` (
	`entryId` text PRIMARY KEY NOT NULL,
	`storeId` text,
	FOREIGN KEY (`storeId`) REFERENCES `UserInteractedStore`(`storeId`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `UserInteractedStore` (
	`storeId` text PRIMARY KEY NOT NULL
);
