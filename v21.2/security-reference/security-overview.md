---
title: CockroachDB Security Overview
summary: An comparison of CockroachDB Security Features broken out Serverless vs Dedicated vs Self-Hosted vs Enterprise
toc: true
docs_area: reference.security
---
## Ways to Use CockroachDB

### CockroachDB Cloud

{{ site.data.products.serverless }} provides fast and easy access (including a *free* tier) to CockroachDB as a web service, hosted by Cockroach Labs. Clusters run in multi-tenant Google Cloud Platform (GCP) or Amazon Web Services (AWS) environments with shared compute and networking resources.

{{ site.data.products.dedicated }} offers a single-tenant cluster running in its own Virtual Private Cloud (VPC). Compute and networking resources are isolated. Additional security-enhancing features such as single-sign on (SSO) and SQL audit logging are available.

[Sign up for a CockroachDB Cloud account!](https://www.cockroachlabs.com/get-started-cockroachdb/)

### Self-Hosted

Cockroach Labs maintains <a href="https://github.com/cockroachdb/cockroach">CockroachDB as an open-source core</a>, which is available to operate under a number of different licensing options, including several free options.

{{ site.data.products.core }} here refers to the situation of a user deploying and operating their own cluster.

{{ site.data.products.enterprise }} refers to an ongoing paid license relationship with Cockroach Labs. This license unlocks advanced features (see below). In this situation the customer maintains full control over their data, compute, and network resources while benefiting from the expertise of the Cockroach Labs' Enterprise Support staff. 

- See the [list of Enterprise features](../enterprise-licensing.html)
- Read the [licensing FAQ](../licensing-faqs.html)
- [Contact our sales team](mailto:sales@cockroachlabs.com) for further questions about {{ site.data.products.enterprise }}

## Comparison of security features

<table>
  <tr>
    <th width="120">Security Domain</th>
    <th>{{ site.data.products.serverless }}</th>
    <th>{{ site.data.products.dedicated }}</th>
    <th>{{ site.data.products.core }}</th>
    <th>{{ site.data.products.enterprise }}</th>
    <th>Feature</th>
  </tr>
 <tr>
   <td rowspan="7"><a href="authentication.html">Authentication</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Inter-node and node identity authentication using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Client identity authentication using username/password</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>✓</td>
  <td>Client identity authentication using TLS 1.2/1.3</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>Client identity authentication with third-party <a href="../sso.html">Single Sign On (SSO)</a> using <a href="https://openid.net/connect/">OpenID Connect OIDC</a></td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>Client identity authentication with <a href="../gssapi_authentication.html">GSSAPI and Kerberos</a></td>
 </tr>
 <tr>
   <td>&nbsp;</td>
   <td>&nbsp;</td>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>HTTP API access using login tokens</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td><a href="https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol">OCSP</a> certificate revocation protocol</td>
 </tr>
 <tr>
   <td rowspan="5" ><a href="encryption.html">Encryption</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Encryption-in-flight using TLS 1.3</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for AWS clusters are encrypted-at-rest using <a href="https://docs.aws.amazon.com/AmazonS3/latest/dev/UsingServerSideEncryption.html">AWS S3’s server-side encryption</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Backups for GCP clusters are encrypted-at-rest using <a href="https://cloud.google.com/storage/docs/encryption/default-keys">Google-managed server-side encryption keys</a></td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Industry-standard encryption-at-rest provided at the infrastructure level by your chosen deployment environment, such as Google Cloud Platform (GCP), Amazon Web Services (AWS), or Microsoft Azure. You can learn more about <a href="https://cloud.google.com/compute/docs/disks#pd_encryption">GCP persistent disk encryption</a>, <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">AWS Elastic Block Storage</a>, or <a href="https://docs.microsoft.com/en-us/azure/virtual-machines/disk-encryption-overview">Azure managed disk encryption</a>.
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>Cockroach Labs' proprietary storage-level <a href="encryption.html#encryption-at-rest-enterprise">encryption-at-rest service</a> implementing the <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard">Advanced Encryption Standard (AED)</a></td>
 </tr>
 <tr>
   <td rowspan="2" ><a href="authorization.html">Authorization</a></td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Users and privileges</td>
 </tr>
 <tr>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>Role-based access control (RBAC)</td>
 </tr>
 <tr>
  <td rowspan="3">Network Security</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="authentication.html"></a>SQL-level configuration allowed authentication attempts by IP address</td>
 </tr>
 <tr>
   <td>&nbsp;</td>
   <td>✓</td>
   <td>✓</td>
   <td>✓</td>
   <td>Network-level Configuration of allowed IP addresses</td>
 </tr>
 <tr>
  <td>&nbsp;</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="../../cockroachcloud/create-your-cluster.html#step-7-enable-vpc-peering-optional">VPC Peering</a> for GCP clusters and AWS PrivateLink for AWS clusters </td>
 </tr>
 <tr>
  <td><a href="https://en.wikipedia.org/wiki/Non-repudiation">Non-Repudiation</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td><a href="../sql-audit-logging.html">SQL Audit Logging</a></td>
 </tr>
 <tr>
  <td><a href="../demo-fault-tolerance-and-recovery.html">Availability/Resilience</a></td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>✓</td>
  <td>CockroachDB, as a distributed SQL database, is uniquely resilient by nature. A cluster can tolerate node failures as long as the majority of nodes remain functional. See <a href="../demo-fault-tolerance-and-recovery.html">Disaster Recovery.</a></td>
 </tr>
</table>

