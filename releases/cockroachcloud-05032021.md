---
title: What&#39;s New in CockroachCloud
toc: true
summary: Additions and changes in CockroachCloud since April 5, 2021.
---

## May 3, 2021

Get future release notes emailed to you:

{% include marketo.html %}

### General changes

- New CockroachCloud clusters will now run CockroachDB [v20.2.8](v20.2.8.html).
- Free clusters are now available in four new regions: GCP `europe-west1`, GCP `asia-southeast1`, AWS `eu-west-1`, and AWS `ap-southeast-1`.
  
### Console changes

- Emails sent from CockroachCloud to users now have updated style and copy.
- When login fails due to user input, the error message now includes [login method](../cockroachcloud/create-an-account.html#change-your-login-method) as a potential reason for failure.
- In the **Send test email** form on the [**Alerts** page](../cockroachcloud/alerts-page.html), three new node-level options have been added to the **Alert type** dropdown menu, a success message is now shown when a test email is sent, and the recipient list is now reset after a successful send.
- Previously, selecting a new cloud provider while [creating a cluster](../cockroachcloud/create-a-free-cluster.html) reset the **Region** and **Hardware per node** options to default. Now, equivalent region and hardware options are preselected, and the number of nodes per region is preserved when a new cloud provider is selected.

### Bug fixes

- Previously, the **Name** field in the **Reset Password** form didn't align with the **Password** field. Now they are the same width.
- **Contact Us** links now direct users to [customer support portal](https://support.cockroachlabs.com/) instead of the user's mail app.
