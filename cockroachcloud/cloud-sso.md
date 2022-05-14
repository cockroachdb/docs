---
title: Single Sign-On (SSO) for Cockroach Cloud
summary: Learn about SSO Authentication for the Cockroach Cloud COnsole
toc: true
docs_area: manage
---

Users may authenticate to the Cockroach [Cloud Console](https://cockroachlabs.cloud) using Single Sign-On (SSO) with Github, Google, or Microsoft as identity providers.

Authentication users with a centralized identity managed by a dedicated provider offers several security advantages to users of Cockroach Cloud:

- All supported SSO providers support multi-factor authentication MFA.
- Administrators avoid having to manage an additional set of credentials and tie those to other identities and credentials. Every additional credential or identity management operation introduces risk as well as costing effort, so minimizing these is a double win.
- Administrators can more easily onboard and offboard.

Enterprise users of GSuite (or users who can integrate their own identity provider with GSuite) can 

Cockroach Cloud Console SSO is powered by [Auth0 B2B](https://auth0.com/b2b-saas).	
## Frequently Asked Questions (FAQ)

### How can I find out more about SSO for Cockroach Cloud?

Contact our [support team](support-resources.html).

### Will it work if I try to sign in with SSO without setting it up, if I already use an email from an SSO Provider?

No, that won't work until you set up SSO for that identity provider. You may be using an email associated with an SSO provider (Google or Microsoft), but it's still just an email and doesn't automatically enable SSO.

To change your SSO method to use that provider, visit **“My Account”** in the Cockroach Cloud Console. 

### Once I change my active login method to a new SSO (Google / Microsoft), can I still sign in using my email/password combination or my Github identity?

No. Only one authentication method can be active for each Cockroach Cloud Console user at a time. Visit **“My Account”** in the Cockroach Cloud Console to configure which authentication method is active.

### Now that we support Google and Microsoft based SSO, would an admin in an enterprise using that feature still need to invite other users to the organization?

Yes, the current mechanism to add new users is through the indicated invite flow. With the second preview release scheduled for ~mid-July, we would provide an auto-onboarding feature. That would allow customer admins to skip the invite flow and just share the organization-specific sign-in URL with their target users internally. When a new user tries to sign-in using the allowed SSO login method for the first time, their identity would be auto-created in their CC organization.

### As an admin, how do I deprovision a user's access to Cockroach Cloud Console if they leave the relevant project?

If the user is leaving the customer company, the admins don’t need to do anything to remove them from the CC organization, provided they’re using one of the new SSO login methods. Once their IT team removes the user from their identity provider, that will automatically remove the access to the CC organization as well. But if the user is staying in the customer company and just won’t access CC anymore, then that deboarding still has to be done manually as today. We can make that seamless once we support SCIM API in the future that would allow seamless integration with the customer's identity provider.

### Can admins require a particular login method for their Cockroach Cloud organization?

Currently, no. That feature is planned for release late.
