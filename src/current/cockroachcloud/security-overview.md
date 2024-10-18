---
title: CockroachDB Cloud Security Overview
summary: Learn about the authentication, encryption, authorization, and audit log features for CockroachDB Cloud clusters.
toc: false
docs_area: manage
---

This page summarizes the security features available in CockroachDB {{ site.data.products.cloud }}:

- CockroachDB {{ site.data.products.standard }}: Deployed in shared (multi-tenant) network and compute infrastructure. Storage scales automatically according to demand, but the cluster's compute requirements are defined explicitly as part of the cluster's configuration.
- CockroachDB {{ site.data.products.basic }}: Deployed in shared (multi-tenant) network and compute infrastructure. Storage and compute scale automatically according to demand, and you are charged only for the storage and activity of your cluster.
- CockroachDB {{ site.data.products.advanced }}: Deployed in dedicated network and compute infrastructure. This deployment may be distributed over multiple regions for added disaster-resilience. In addition to infrastructure isolation, Advanced clusters can be customized with advanced network, identity-management, and encryption-related security features required for high benchmark security goals such as [PCI DSS compliance]({% link cockroachcloud/pci-dss.md %}). Refer to [Payment Card Industry Data Security Standard (PCI DSS) Compliance in CockroachDB Advanced]({% link cockroachcloud/pci-dss.md %})

The following table summarizes the CockroachDB {{ site.data.products.cloud }} security features and provides links to detailed documentation for each feature where applicable.

<table markdown="1">
  <thead>
    <tr>
      <td width="120">Security Domain</td>
      <td>CockroachDB Basic</td>
      <td>CockroachDB Standard</td>
      <td>CockroachDB Advanced</td>
      <td>Feature</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="8"><a href="{% link cockroachcloud/authentication.md %}">Authentication</a></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Inter-node and node identity authentication using TLS 1.3</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Client identity authentication using a username and password</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link {{ site.current_cloud_version }}/security-reference/scram-authentication.md %}">SASL/SCRAM-SHA-256 secure password-based authentication</a></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td>Cluster DB console authentication with third-party <a href="{% link {{ site.current_cloud_version }}/sso-db-console.md %}">Single Sign On (SSO)</a> using <a href="https://openid.net/connect/">OpenID Connect OIDC</a> or <a href="https://wikipedia.org/wiki/Security_Assertion_Markup_Language">SAML</a></td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>SQL Client authentication with <a href="{% link cockroachcloud/cloud-sso-sql.md %}">Cluster SSO</a> using CockroachDB Cloud as identity provider</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>SQL Client authentication with <a href="{% link {{ site.current_cloud_version }}/sso-sql.md %}">Cluster SSO</a> using customer-managed identity providers</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td>Client identity authentication using <a href="{% link cockroachcloud/client-certs-advanced.md %}">PKI certificates</a></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td><a href="{% link {{ site.current_cloud_version }}/manage-certs-revoke-ocsp.md %}">OCSP</a> certificate revocation protocol</td>
    </tr>
    <tr>
    <td rowspan="5" >Data Protection</a></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Encryption-in-flight using TLS 1.3</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Automatic backups for AWS clusters are encrypted-at-rest using <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html">AWS S3’s server-side encryption</a></td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Automatic backups for GCP clusters are encrypted-at-rest using <a href="https://cloud.google.com/storage/docs/encryption/default-keys">Google-managed server-side encryption keys</a></td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Industry-standard encryption-at-rest provided at the infrastructure level by your chosen deployment environment, such as Google Cloud Platform (GCP), Amazon Web Services (AWS), or Microsoft Azure.
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/cmek.md %}">Customer Managed Encryption Keys (CMEK)</a>, with [Advanced security features]({% link cockroachcloud/create-an-advanced-cluster.md %}#step-6-configure-advanced-security-features) enabled.
    </tr>
    <tr>
    <td rowspan="3" ><a href="{% link cockroachcloud/authorization.md %}">Access Control (Authorization)</a></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>SQL users with direct privilege management</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>SQL Role-based access control (RBAC)</td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Cloud Organization users with fine-grained access roles</td>
    </tr>
    <tr>
    <td rowspan="7">Network Security</td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/authentication.md %}">SQL-level configuration of allowed authentication attempts by IP address</a></td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/private-clusters.md %}">Private Clusters</a></td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>Network-level Configuration of allowed IP addresses</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td>Egress Perimeter Controls</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/network-authorization.md %}#gcp-private-service-connect">Private Service Connect (PSC) (Preview)</a> for GCP clusters</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/network-authorization.md %}#gcp-vpc-peering">VPC Peering</a> for GCP clusters</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/network-authorization.md %}#aws-privatelink"></a>PrivateLink for AWS clusters. </td>
    </tr>
    <tr>
      <td rowspan="2"><a href="https://wikipedia.org/wiki/Non-repudiation">Non-Repudiation</a></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link {{ site.current_cloud_version }}/sql-audit-logging.md %}">SQL Audit Logging</a></td>
    </tr>
    <tr>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td><a href="{% link cockroachcloud/cloud-org-audit-logs.md %}">Cloud Organization Audit Logging</a></td>
    </tr>
    <tr>
      <td><a href="{% link {{ site.current_cloud_version }}/demo-cockroachdb-resilience.md %}">Availability/Resilience</a></td>
      <td>✓</td>
      <td>✓</td>
      <td>✓</td>
      <td>CockroachDB, as a distributed SQL database, is uniquely resilient by nature. A cluster can tolerate node failures as long as the majority of nodes remain functional. See <a href="{% link {{ site.current_cloud_version }}/demo-cockroachdb-resilience.md %}">Disaster Recovery.</a></td>
    </tr>
  </thead>
</table>
