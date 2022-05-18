---
title: Single Sign-On (SSO) for Cockroach Cloud
summary: Learn about SSO Authentication for the Cockroach Cloud Console
toc: true
docs_area: manage
---

Users may authenticate to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) using Single Sign-On (SSO) with GitHub, Google, or Microsoft as identity providers.

Authentication with a centralized identity managed by a dedicated provider offers several security advantages:

- All supported SSO providers (Google, Microsoft, and GitHub) support multi-factor authentication (MFA).
- Administrators avoid having to manage an additional set of credentials and tie those to other identities and credentials. Every additional credential or identity management operation introduces risk as well as costing effort, so minimizing these is doubly advantageous.
- Administrators can onboard and offboard users quickly and efficiently

## Frequently Asked Questions (FAQ)


### Will it work if I try to sign in with SSO without explicitly setting it up for my account, if I already use an email from an SSO Provider (e.g., my-example-account@gmail.com)?

No, that won't work until you set up SSO for your account with that specific identity provider. Using an email associated with an SSO provider (Google, GitHub, or Microsoft) does not automatically enable SSO.

To change your SSO method to use that provider, visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud).

### Once I change my active login method to a new SSO provider, can I still sign in using my email/password combination or my GitHub identity?

No. Only one authentication method can be active for each {{ site.data.products.db }} Console user at a time. Visit **My Account** in the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud) to configure which authentication method is active.

### Does this change how administrators invite users?

At the moment, no. The [workflow for inviting team members](console-access-management.html#invite-team-members-to-cockroachdb-cloud) to {{ site.data.products.db }} remains the same.

### As an admin, how do I deprovision a user's access to {{ site.data.products.db }} Console if they leave the relevant project?

If a user is using SSO, deleting the user's identity at the level of the SSO provider (e.g., deleting their Google account), will remove their access to the {{ site.data.products.db }} organization.

To remove a user's access to {{ site.data.products.db }} without deleting their SSO identity, you can [remove their {{ site.data.products.db }} user identity from your org](console-access-management.html#delete-a-team-member) in the console.

### Can admins require a particular login method for their {{ site.data.products.db }} organization?

Currently, no.
