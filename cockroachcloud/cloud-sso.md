---
title: Single Sign-On (SSO) for Cockroach Cloud
summary: Learn about SSO Authentication for the Cockroach Cloud COnsole
toc: true
docs_area: manage
---

Users may authenticate to the Cockroach [Cloud Console](https://cockroachlabs.cloud) using Single Sign-On (SSO) with Github, Google, or Microsoft as identity providers.

Authentication users with a centralized identity managed by a dedicated provider offers several security advantages to users of Cockroach Cloud:

- All supported SSO providers (Google, Microsoft, and Github) support multi-factor authentication MFA.
- Administrators avoid having to manage an additional set of credentials and tie those to other identities and credentials. Every additional credential or identity management operation introduces risk as well as costing effort, so minimizing these is a double win.
- Administrators can rapidly and simply onboard and offboard users.

Cockroach Cloud Console SSO is powered by [Auth0 B2B](https://auth0.com/b2b-saas).	

## Frequently Asked Questions (FAQ)

### How can I find out more about SSO for Cockroach Cloud?

Contact our [support team](../{{site.versions["stable"]}}/support-resources.html).

### Will it work if I try to sign in with SSO without setting it up, if I already use an email from an SSO Provider?

No, that won't work until you set up SSO for that identity provider. You may be using an email associated with an SSO provider (Google or Microsoft), but it's still just an email and doesn't automatically enable SSO.

To change your SSO method to use that provider, visit **“My Account”** in the Cockroach Cloud Console. 

### Once I change my active login method to a new SSO (Google / Microsoft), can I still sign in using my email/password combination or my Github identity?

No. Only one authentication method can be active for each Cockroach Cloud Console user at a time. Visit **“My Account”** in the Cockroach Cloud Console to configure which authentication method is active.

### Does this change how administrators invite users?

At the moment, no. The [workflow for inviting team members](console-access-management.html#invite-team-members-to-cockroachdb-cloud) to {{ site.data.products.db }} remains the same.

A future release will provide an auto-onboarding feature allowing administrators to share an organization-specific sign-in URL, which will generate a new {{ site.data.products.db }} identity when it is first used.
n their CC organization.

### As an admin, how do I deprovision a user's access to Cockroach Cloud Console if they leave the relevant project?

If a user is using SSO, deleting the user's identity at the level of the SSO provider (e.g., deleting their work Google account), will remove their access to the {{ site.data.products.db }} organization.

To remove a user's access to {{ site.data.products.db }} without deleting their SSO identity, you can [delete their {{ site.data.products.db }} team member user identity](console-access-management.html#delete-a-team-member) in the console.

If the user is leaving the customer company, the admins don’t need to do anything to remove them from the CC organization, provided they’re using one of the new SSO login methods.

### Can admins require a particular login method for their Cockroach Cloud organization?

Currently, no. That feature is planned for release late.
