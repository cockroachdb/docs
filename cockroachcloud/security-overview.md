---
title: CockroachDB Cloud Security
summary: Learn about the authentication, encryption, authorization, and audit log features for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

This page summarizes the security features available in the two database cluster types offered by {{ site.data.products.db }}, **serverless** and **dedicated**.

A {{ site.data.products.serverless }} cluster is deployed for a specific customer in *shared* (multi-tenant) network and compute infrastrucutre.

A {{ site.data.products.dedicated }} cluster is deployed for a specific customer in a cloud provider's network and compute infrastructure *dedicated* to that customer. This deployment may be distributed over multiple regions for added disaster-resilience. In addition to infrastructure isolation, dedicated clusters can be customized with advanced network, identity-management, and encryption-related security features required for high benchmark security goals such as [PCI DSS compliance](pci-dss.html).

Refer to [Payment Card Industry Data Security Standard (PCI DSS) Compliance in CockroachDB Dedicated](pci-dss.html)

The following table summarizes the {{ site.data.products.db }} security features and provides links to detailed documentation for each feature where applicable.

<table>
  <tr>
    <th width="120">Security Domain</th>
    <th>CockroachDB Serverless</th>
    <th>CockroachDB Dedicated</th>
    <th>Feature</th>
  </tr>
  <tr>
    <td rowspan="8"><a href="authentication.html">Authentication</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>Inter-node and node identity authentication using TLS 1.3</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>Client identity authentication using a username and password</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td><a href="../{{site.versions['stable']}}/security-reference/scram-authentication.html">SASL/SCRAM-SHA-256 secure password-based authentication</a></td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td>Cluster DB console authentication with third-party <a href="../{{site.versions['stable']}}/sso-db-console.html">Single Sign On (SSO)</a> using <a href="https://openid.net/connect/">OpenID Connect OIDC</a> or <a href="https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language">SAML</a></td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>SQL Client authentication with <a href="cloud-sso-sql.html">Cluster SSO</a> using CockroachDB Cloud as identity provider</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>SQL Client authentication with <a href="../{{site.versions['stable']}}/sso-sql.html">Cluster SSO</a> using customer-managed identity providers</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td>Client identity authentication using <a href="client-certs-dedicated.html">PKI certificates</a></td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td><a href="../{{site.versions['stable']}}/manage-certs-revoke-ocsp.html">OCSP</a> certificate revocation protocol</td>
  </tr>
  <tr>
  <td rowspan="5" >Data Protection</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>Encryption-in-flight using TLS 1.3</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>Automatic backups for AWS clusters are encrypted-at-rest using <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html">AWS S3’s server-side encryption</a></td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>Automatic backups for GCP clusters are encrypted-at-rest using <a href="https://cloud.google.com/storage/docs/encryption/default-keys">Google-managed server-side encryption keys</a></td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>Industry-standard encryption-at-rest provided at the infrastructure level by your chosen deployment environment, such as Google Cloud Platform (GCP), Amazon Web Services (AWS), or Microsoft Azure.
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td><a href="cmek.html">Customer Managed Encryption Keys (CMEK)</a>.
  </tr>
  <tr>
  <td rowspan="3" ><a href="authorization.html">Access Control (Authorization)</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>SQL users with direct privilege management</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>SQL Role-based access control (RBAC)</td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td>Cloud Organization users with fine-grained access roles</td>
  </tr>
  <tr>
  <td rowspan="6">Network Security</td>
    <td>✓</td>
    <td>✓</td>
    <td><a href="authentication.html">SQL-level configuration of allowed authentication attempts by IP address</a></td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td><a href="https://www.cockroachlabs.com/docs/cockroachcloud/private-clusters">Private Clusters</a></td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td>Network-level Configuration of allowed IP addresses</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td>Egress Perimeter Controls</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td><a href="network-authorization.html#vpc-peering">VPC Peering</a> for GCP clusters</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>✓</td>
    <td><a href="network-authorization.html#aws-privatelink"></a>PrivateLink for AWS clusters </td>
  </tr>
  <tr>
    <td rowspan="2"><a href="https://en.wikipedia.org/wiki/Non-repudiation">Non-Repudiation</a></td>
    <td>✓</td>
    <td>✓</td>
    <td><a href="../{{site.versions['stable']}}/sql-audit-logging.html">SQL Audit Logging</a></td>
  </tr>
  <tr>
    <td>✓</td>
    <td>✓</td>
    <td><a href="cloud-org-audit-logs.html">Cloud Organization Audit Logging</a></td>
  </tr>
  <tr>
    <td><a href="../{{site.versions['stable']}}/demo-fault-tolerance-and-recovery.html">Availability/Resilience</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>CockroachDB, as a distributed SQL database, is uniquely resilient by nature. A cluster can tolerate node failures as long as the majority of nodes remain functional. See <a href="../{{site.versions['stable']}}/demo-fault-tolerance-and-recovery.html">Disaster Recovery.</a></td>
  </tr>
</table>
