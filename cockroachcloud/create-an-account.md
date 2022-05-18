---
title: Create a CockroachDB Cloud account
summary: Learn how to create and delete a CockroachDB Cloud account
toc: true
docs_area: deploy
---

Before you [create a {{ site.data.products.db }} cluster](create-your-cluster.html), you must first create a {{ site.data.products.db }} account. You can register for {{ site.data.products.db }} using a GitHub, Google, or Microsoft account or an email address and password.

## Choose an authentication method

You may authenticate to {{ site.data.products.db }} console using an email and password, or with [Single Sign-on (SSO)](cloud-sso.html). The console supports SSO provided by Github, Google, and Microsoft.

SSO provides security benefits. This includes not having to manage an additional credential, and perhaps most importantly, that SSO providers support multi-factor authentication (MFA). For best security, we recommend that all {{ site.data.products.db }} users authenticate with SSO, with MFA enabled.

## Register a new account

To register a new account, navigate to the [{{ site.data.products.db }} registration page](https://cockroachlabs.cloud/signup?referralId=docs_create_account).

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="github">Register with Single Sign-On (SSO)</button>
  <button class="filter-button page-level" data-scope="email">Register with email</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="github">

1. Click **Sign up with...** for your chosen SSO Provider.
1. Select the checkbox to accept the [terms of service](https://www.cockroachlabs.com/cloud-terms-and-conditions) and [privacy policy](https://www.cockroachlabs.com/privacy).
1. Log in to your account with your SSO provider and respond to the email or other notification inviting you to  **Authorize {{ site.data.products.db }} by Cockroach Labs**

{{site.data.alerts.callout_info}}
We highly recommend enabling multi-factor authentication (MFA) with your SSO provider, if you have not done so.
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="email">
1. Enter your **Email address**.
1. Enter your **Name**.
1. Enter a **Password**.
1. Enter your **Organization name (optional)**.

    This can be [changed](#change-your-organization-name) later.

1. Select the checkbox to accept the [terms of service](https://www.cockroachlabs.com/cloud-terms-and-conditions) and [privacy policy](https://www.cockroachlabs.com/privacy).
1. Click **Get Started**.

    A confirmation email will be sent. Click **Verify email** in the email to confirm your account.
</section>

## Log in to your account

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="github">Log in with Single Sign-On (SSO)</button>
  <button class="filter-button page-level" data-scope="email">Log in with email</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="github">

1. Navigate to the {{ site.data.products.db }} [log in page](https://cockroachlabs.cloud/clusters).
1. Click **Log in with...** for your chosen SSO provider.
1. Watch for a pop-up or modal from your SSO Provider and follow the prompts to log in.
</section>

<section class="filter-content" markdown="1" data-scope="email">

1. Navigate to the {{ site.data.products.db }} [log in page](https://cockroachlabs.cloud/clusters).
1. Enter your **Email** and **Password**.
1. Click **Continue**.

    The [**Clusters** page](cluster-management.html) displays.
</section>

## Change your account details

- [Change your account name](#change-your-account-name)
- [Change your email](#change-your-email)
- [Change your account password](#change-your-account-password)
- [Change your organization name](#change-your-organization-name)
- [Change your login method](#change-your-login-method)

### Change your account name

To change your account name:

1. Click the account icon in the top right corner.
1. From the dropdown, select **My Account**.
1. Click the pencil icon in the **Name** row.
1. In the **Edit name** dialog, enter your **Name**.
1. Click **Save**.

### Change your email

If you registered with an email address, you can change your account password in the {{ site.data.products.db }} Console:

1. Click the account icon in the top right corner.
1. From the dropdown, select **My Account**.
1. Click the pencil icon in the **Email address** row.
1. In the **Change email address** dialog, enter the new **Email address**.
1. Click **Save**.

    A confirmation email will be sent to the new email address. Click **Verify email** in the email to confirm the change.

### Change your account password

If you registered with an email address, you can change your account password in the {{ site.data.products.db }} Console:

1. Click the account icon in the top right corner.
1. From the dropdown, select **My Account**.
1. Click the pencil icon in the **Password** row.
1. In the **Change password** dialog, enter your **Current password** and **New password**.
1. Click **Save**.

{{site.data.alerts.callout_info}}
Changing your account password will _not_ change your [SQL user](user-authorization.html#create-a-sql-user) password.
{{site.data.alerts.end}}

### Change your organization name

If you are a [Console Admin](console-access-management.html#console-admin), you can change your organization name:

1. Navigate to the **Settings** page.

    <img src="{{ 'images/cockroachcloud/settings-page.png' | relative_url }}" alt="Settings page" style="border:1px solid #eee;max-width:100%" />

1. Click the pencil icon in the **Organization name** row.
1. In the **Edit organization name** dialog, enter the new **Organization name**.
1. Click **Save**.

### Change your login method

You can change your method of login authentication (email/password or SSO with a specific provider), in the [**My Account** page in the {{ site.data.products.db }} Console](https://cockroachlabs.cloud/account/profile).

Once you have changed your authentication method, you will receive a confirmation email."
