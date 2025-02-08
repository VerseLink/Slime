<h1 align="center">Slime</h1>
<h3 align="center">Coupon code discovery service done right and <b><i>✨ethically✨</i></b>.</h3>
<p align="center">
    <i>Powered by open source, cloudflare workers and the community</i>
</p>
<p align="center">
    <img src="https://img.shields.io/badge/add_to_chrome-339946?style=for-the-badge&logo=chromewebstore&logoColor=f5f5f5">
    <img src="https://img.shields.io/badge/release-v0.1.0_BETA-blue?style=for-the-badge">
    <img src="https://img.shields.io/badge/license-AGPL_v3-orange?style=for-the-badge">
</p>

## Our Mission

> [!TIP]
> "You never change things by fighting the existing reality. To change something, build a new model that makes the existing model obsolete." — Buckminster Fuller

Our mission is simple:
- Prioritize in providing user with the best savings, whether by coupon code or from alternative stores.
- Support creators and discourage users to override affiliate codes. 
- Make the coupon code market a more ethical place

Coupon extensions has been proven to useful most of the time, until it isn't. Some coupon discovery extensions has claimed to find the best deal for their users, until they hid them from their users.

All codes powering Slime are visible[^1] and can be reviewed on this repo.

## Features

As we are in beta, we may not support as much site as other competitive services, however, any support is apperciated to develop and provide the best for our community.

- ✔️ ***Actually*** finds you the best code, no store can hide codes from you!
- 🙌 **Collaborative coupon discovery**, anyone with Slime can share codes they've found.
- 😊 Coupon codes you submit ***MATTERS***.
- 🌐 **Available on most websites**, regardless if it's not natively supported, you can still share codes with others.
- 🔓 Open sourced, free and reviewed by the community.
- 🔍 Fully fledged automatic coupon code review and vetting process.

Features that are still in development or not widely available in production. But is in our 

- 💬 Notify users when a creators affiliate was overriden by other extensions.
- 📈 **Better rewards** and cashback from each purchase.


## Monetization

> [!Important]
> We will never override any **creators affiliate code**. It is as important to protect creators as much as the users we serve [^3].

To provide a competitive product against alternative services, it is neccessary to generate revenue to provide 

During Beta version of this service, these monetization will be slowly implemented.

- **Github Sponsorship or Donations**: The early days

### Roadmap

These method of monetization are not currently implemented, but are planned


- **Subscriptions**: Users can purchase subscription at a low price to allow more customization to their Slime client, turn on or off features that make their experience better.

- **Affiliate code**: We apply affiliate code when users choose to enable ***Slime Rewards*** or when a coupon is applied. We will never override affiliate code if we detect any existing ones[^3].

- **Product Placements**: Feature users with products similar to the ones that they are browsing, only *similar quality and lower priced items* are allowed to be featured and placed as a centric theme to serve Slime's goal of providing the best competitive price.

- **Store Partnership**: We will partner with 

### Data Collection

See our [Privacy Policy](https://useslime.com/privacy) for more information.

The general TL;DR is that we will not collect users activity while the extension is active, and only record neccessary activities while visit online shops with neccessary hash and anonymization needed to report these data anonymously. These data would only be used to analyze traffics and understand which sites require more support attention and provide insights for site owners to better understand their traffics.

When you delete your account, all activities associated with the account with be erased within 30 days of deletion.


## Quick Start

This is a monorepo that contains a few different components that makes up the Slime service.

#### Client
While we recommend downloading directly from the chrome extension as it always keep you up-to-date with the our backend. There may be cases where you may wish to customize certain behaviours or to run your own version of the client.

You can find the client under [/apps/slime-client](/app/slime-client/).

Built with [WXT](https://github.com/wxt-dev/wxt/) and with love.

#### Authentication

- [Backend](/apps/slime-accounts/): Slime 

## Support Us 

Like most open source projects, you can always sponsor this project to help us speed up our development.

Additionally, word of mouth is far more important than anything, feel free to recommend this project to your friend or any content creators you know of.

If you are a content creator and wish to collaborate with us, feel free to shout us out or reach out to us at [creators@useslime.com](emailto:creators@useslime.com)!


## FAQ

#### Can I request Slime to remove or hide coupon codes that are internal use only?
> [!Note]
> Unlike other similar close sourced tools, our policy is to never remove a code once discovered.
 
We should not be responsible for stores inablity to properly manage their coupons, and thus no stores are allowed to "takedown" a code. However, partnered stores will be notified about discovery of coupons, however, it will be their responsibility to take down such code.

We will only temporarily disable a coupons visibility and a grace period of 5 days if it were reported and deemed as an obvious mistakes. This only applies to coupon codes that (i) offer over 40% and or above discounts (ii) provide gifts or other items that costs 50% more of the original price.



[^1]: Code that are used to combat spam, filter, or otherwise detect bot submissions are not visible this repo to avoid potential attackers from knowing the exact filter method to circumvent them, this repo provides abstraction neccessarily to implement such code, while also provide basic implementation neccessary to run the server or the clients.

[^3]: We only override affiliate codes from providers that actively override other people's affiliate code, which is the only acceptable exception when it comes to overriding code or cookies.