---
title: Cluster Single Sign-on (SSO) using CockroachDB Cloud Console
summary: Overview of Cluster Single Sign-on (SSO) for {{ site.data.products.db }}, review of authenticating users, configuring required cluster settings.
toc: true
docs_area: manage
---

Cluster SSO allows users to access the SQL interface of a CockroachDB cluster (whether provisioned on {{ site.data.products.db }} or self-hosted) with the full security of Single Sign-On (SSO), and the convenience of being able to choose from a variety of SSO identity providers, including {{ site.data.products.db }}, Google, Azure, GitHub, or your own self-hosted OIDC.

This page describes the procedure for accessing a {{ site.data.products.db }} cluster using the {{ site.data.products.db }} console as identity provider.

To authenticate using JWT tokens from your external IdP, refer to [Cluster Single Sign-on (SSO) using JSON web tokens (JWT)](../{{site.versions["stable"]}}/sso-sql.html).

{{site.data.alerts.callout_info}}
This authentication method works for human users but not for service accounts, since only humans may have {{ site.data.products.db }} Console identities. To authenticate service accounts using JWT tokens from an external IdP, refer to [Cluster Single Sign-on (SSO) using JSON web tokens (JWT)](../{{site.versions["stable"]}}/sso-sql.html).

Note that the topic of this page is SQL access to a specific CockroachDB Cluster, not access to a {{ site.data.products.db }} organization. For the latter, see [Single Sign-On (SSO) for {{ site.data.products.db }} organizations](cloud-org-sso.html).
{{site.data.alerts.end}}

## Before you begin

- You must be a member of a {{ site.data.products.db }} organization, and you must have access to an existing cluster or the permission to create a new cluster. For help setting up an organization and cluster, refer to [Quickstart with CockroachDB](quickstart.html).
- To authenticate to a specific cluster using SSO, a {{ site.data.products.db }} user must have a corresponding SQL user already [created](../{{site.versions["stable"]}}/create-user.html#create-a-user) on that cluster. {{ site.data.products.db }} generates a SSO SQL username for each console, corresponding to the user's email by the convention `sso_{email_name}`, where `email_name` is everything up to the `@` in an email address, for example the SQL user `sso_docs` would result from `docs@cockroachlabs.com`. `ccloud` will prompt you to make this user if it does not already exist, in which case an admin must create it manually. 
- [`ccloud`, the {{ site.data.products.db }} CLI](ccloud-get-started.html) must be installed on your local system.

## Learn more

This [Cockroach Labs blog post](https://www.cockroachlabs.com/blog/) covers and provides further resources for a variety of auth token-issuing use cases, including using Okta and Google Cloud Platform to issue tokens.

## Sign in with Cluster SSO


1. Authenticate `ccloud` to your {{ site.data.products.db }} organization. When you run the following command, your workstation's default browser opens the {{ site.data.products.db }} login page for your organization.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud auth login --org {your organization label}
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

1. You may then use the `ccloud` utility to authenticate to your {{ site.data.products.db }} cluster, allowing you to access the SQL interface. Your browser will open again as `ccloud` requests an access token, although will not need to log in again if you are already logged in.

	{% include_cached copy-clipboard.html %}
	~~~shell
	ccloud cluster sql --sso {your cluster name}
	# when running ccloud on a remote host, add the following:
	# --no-redirect
	~~~

## Troubleshooting

If you get an error that the SQL user is missing, you may need to create it manually. The SQL user's username **must** match the {{ site.data.products.db }} identity's email address, according to the following convention:

email: `{name}@emaildomain.com`
SQL username: `sso_{name}`

For example, a user named `docs_rule@cockroachlabs.com` would need a SQL username of `sso_docs_rule`

You can [create a user](ccloud-get-started.html#create-a-sql-user-using-ccloud-cluster-user-create) with:

{% include_cached copy-clipboard.html %}
 ~~~shell
 `ccloud cluster user create {cluster name} {SSO SQL username}`
 ~~~
 

