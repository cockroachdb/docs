---
title: Cluster Single Sign-on (SSO) using the Cloud Console
summary: Overview of Cluster Single Sign-on (SSO) for CockroachDB Cloud, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on CockroachDB {{ site.data.products.cloud }} or {{ site.data.products.core }}) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including CockroachDB {{ site.data.products.cloud }}, Google, Azure, GitHub, or your own {{ site.data.products.core }} OIDC.

This page describes the procedure for accessing a CockroachDB {{ site.data.products.cloud }} cluster using the CockroachDB {{ site.data.products.cloud }} console as identity provider.

To authenticate using JWT tokens from your external IdP, refer to [Cluster Single Sign-on (SSO) using JSON web tokens (JWT)]({% link {{site.current_cloud_version}}/sso-sql.md %}).

{{site.data.alerts.callout_info}}
This authentication method works for human users but not for service accounts, since only humans may have CockroachDB {{ site.data.products.cloud }} Console identities. To authenticate service accounts using JWT tokens from an external IdP, refer to [Cluster Single Sign-on (SSO) using JSON web tokens (JWT)]({% link {{site.current_cloud_version}}/sso-sql.md %}).

Note that the topic of this page is SQL access to a specific CockroachDB Cluster, not access to a CockroachDB {{ site.data.products.cloud }} organization. For the latter, see [Single Sign-On (SSO) for CockroachDB {{ site.data.products.cloud }} organizations]({% link cockroachcloud/cloud-org-sso.md %}).
{{site.data.alerts.end}}

## Before you begin

For more details and examples, refer to [SSO to CockroachDB clusters using JWT](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) in the CockroachDB blog.

- You must be a member of a CockroachDB {{ site.data.products.cloud }} organization, and you must have access to an existing cluster or the permission to create a new cluster. For help setting up an organization and cluster, refer to [Quickstart with CockroachDB]({% link cockroachcloud/quickstart.md %}).
- To authenticate to a specific cluster using SSO, a CockroachDB {{ site.data.products.cloud }} user must have a corresponding SQL user already [created]({% link {{site.current_cloud_version}}/create-user.md %}#create-a-user) on that cluster. CockroachDB {{ site.data.products.cloud }} generates a SSO SQL username for each console, corresponding to the user's email by the convention `sso_{email_name}`, where `email_name` is everything up to the `@` in an email address, for example the SQL user `sso_docs` would result from `docs@cockroachlabs.com`. `ccloud` will prompt you to make this user if it does not already exist, in which case an admin must create it manually.
- [`ccloud`, the CockroachDB {{ site.data.products.cloud }} CLI]({% link cockroachcloud/ccloud-get-started.md %}) must be installed on your local system.

## Sign in with Cluster SSO


1. Authenticate `ccloud` to your CockroachDB {{ site.data.products.cloud }} organization. When you run the following command, your workstation's default browser opens the CockroachDB {{ site.data.products.cloud }} login page for your organization.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login --org {your organization label}
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

1. You may then use the `ccloud` utility to authenticate to your CockroachDB {{ site.data.products.cloud }} cluster, allowing you to access the SQL interface. Your browser will open again as `ccloud` requests an access token, although will not need to log in again if you are already logged in.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso {your cluster name}
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

## Troubleshooting

If you get an error that the SQL user is missing, you may need to create it manually. The SQL user's username **must** match the CockroachDB {{ site.data.products.cloud }} identity's email address, according to the following convention:

email: `{name}@emaildomain.com`
SQL username: `sso_{name}`

For example, a user named `docs_rule@cockroachlabs.com` would need a SQL username of `sso_docs_rule`

You can [create a user]({% link cockroachcloud/ccloud-get-started.md %}#create-a-sql-user-using-ccloud-cluster-user-create) with:

{% include_cached copy-clipboard.html %}
 ~~~shell
 `ccloud cluster user create {cluster name} {SSO SQL username}`
 ~~~

## What's Next?

- Read about [SSO to CockroachDB clusters using JWT](https://www.cockroachlabs.com/blog/sso-to-clusters-with-jwt/) in the CockroachDB blog.
- Learn more about [CockroachDB {{ site.data.products.cloud }} Organization SSO]({% link cockroachcloud/cloud-org-sso.md %}).
