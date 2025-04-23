# Routing Designs Notes
This document holds the design thoughts for the Slime Backend API.
You should not use this document as a mean to implement the client as it may differ from the actual implemnetion.

## /api/v1/stores

Holds all logical resources under a store, for example, coupons, metadata, instructions of how to apply coupons and or any resources related to stores.

There are logically two kinds of store that exists under Slime, govern by two url path.
They sometimes share similar resources and will be listed in detail if such was the case.
| Path | Description
| - | - |
| /api/v1/stores/{storeId} | Stores created manually with recognition and some form of support. This includes cases like simply acknowledging it as a store without any other form of techinical support (such as auto applying coupons or price analysis)
| /api/v1/stores/unknown/{url}/ | Stores created automatically because a user reported a coupon on a website that has not yet been actually recognized as a store

The following documentation will list the path under `/api/v1/stores/{storeId}` as such path contains a superset of method compared to `/api/v1/stores/unknown/{url}`.

### /api/v1/stores

| Method | Path | Restrictions | Description
| - | - | - | - |
| GET | / | N/A | Get's a list of stores available under a given domain
| POST | / | Moderator | **[NOT IMPLEMENTED]** Create's a new store
| PATCH | /migrate | Moderator | **[NOT IMPLEMENTED]** Migrates an `/unknown/{url}` store to a an official store

### /api/v1/stores/{storeId}/codes

> [!NOTE]
> Also availble under `/api/v1/stores/unknown/{url}/codes`

| Method | Path | Restrictions | Description
| - | - | - | - |
| GET | / | N/A | Get's a list of coupons available under this domain
| POST | / | N/A | Report or add a new coupon discovered by user or moderators, user submitted reports are subjected to filter and automatic review. <br/><br/> When a user submits a code to an unknown domain, the store is automatically created as an unknown store. Rate limits maybe required.
| POST | /report-usage | N/A | Reports what the result of apply codes provided, usually performed on the checkout page. <br/><br/> <i>In the code sometimes this action is referred as `Checkout` but the user may not have actually purchased anything. There also needs to have a rule to handle duplicate submissions and what counts as a duplicate entry.</i>

#### /api/v1/stores/{storeId}/codes/{couponId}

Handles the operation of a singular coupon.

| Method | Path | Restrictions | Description
| - | - | - | - |
| GET | / | Moderator / Store Owners | **[NOT IMPLEMENTED]** Get's the details of a coupon, include detailed list of how the coupon is used and the historic data of success / failed applied code
| PATCH | / | Moderator | **[NOT IMPLEMENTED]** Updates the detail of a coupon
| DELETE | / | Moderator | **[NOT IMPLEMENTED]** Delete's a coupon, usually if the coupon is problematic, or actually flagged as problematic. Store owners CANNOT delete a coupon aside from reporting it.
| PUT  | /approve | Moderator | **[NOT IMPLEMENTED]** A moderator approves a coupon and accept it as an usuable coupon
| DELETE  | /approve | Moderator | **[NOT IMPLEMENTED]** A moderator disapproves a coupon and accept it as an usuable coupon
| POST | /report-abuse | N/A | Reports the coupon as potentially abusive and flags for review

## /api/v1/user

Get's the user details under Slime.

This endpoint is incapable of creating or deleting any account, such resposibility is handled by Slime Auth, a central auth controlling service that issues new access token and refresh token (basically handle auth, claims and basic account management). Although a button is offered on the client to delete the account, the operation is done on the Slime Auth repository.


| Method | Path | Restrictions | Description
| - | - | - | - |
| GET | /me | User | Get's the full metadata and account information associated with the user
| PATCH | /me | User | Update's the user account information and or preferences