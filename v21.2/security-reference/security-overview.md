---
title: CockroachDB Security Overview
summary: An overview of CockroachDB Security Features broken by Product, Cloud Serverless and Dedicated, Self-Hosted and Enterprise
toc: true
docs_area: reference.security
---
## Product Definitions

### Cloud Products

<b>CockroachDB Serverless</b> (beta) provides fast and easy access (including a *free* tier) to CockroachDB as a web service, hosted by Cockroach Labs. Clusters run in multi-tenant Google Cloud Platform (GCP) or Amazon Web Services (AWS) environments with shared compute and networking resources.

<b>CockroachDB Dedicated</b> offers a single-tenant cluster running in its own Virtual Private Cloud (VPC). Compute and networking resources are isolated. Additional security-enhancing features such as single-sign on (SSO) and SQL audit logging are available.

[Sign up for a CockroachDB Cloud account!](https://www.cockroachlabs.com/get-started-cockroachdb/)

### Self-Hosted Products

Cockroach Labs maintains <a href="https://github.com/cockroachdb/cockroach">CockroachDB as an open-source core</a>, which is available to operate under a number of different licensing options, including several free options.

<b>Self-Hosted CockroachDB</b> here refers to the situation of a user deploying and operating their own cluster.

<b>Self-Hosted CockroachDB Enterprise</b> refers to an ongoing paid license relationship with Cockroach Labs. This license unlocks advanced features (see below). In this situation the customer maintains full control over their data, compute, and network resources while benefiting from the expertise of the Cockroach Labs' Enterprise Support staff. 

- See the [list of Enterprise features](../enterprise-licensing.html)
- Read the [licensing FAQ](../licensing-faqs.html)
- [Contact our sales team](mailto:sales@cockroachlabs.com) for further questions about CockroachDB Enterprise

## Comparison of security features in CockroachDB product offerings

<table>
  <tr>
    <th width="120">Security Domain</th>
    <th>Serverless Cloud</th>
    <th>Dedicated Cloud</th>
    <th>Self-Hosted</th>
    <th>Self-Hosted Enterprise</th>
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
  <td>Client identity authentication with third party <a href="../sso.html">Single Sign On (SSO)</a> using <a href="https://openid.net/connect/">OpenID Connect OIDC</a></td>
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
  <td>Industry standard encryption-at-rest provided at the infrastructure level by your chosen infrastructure-as-a-service (IAAS) provider, either Google Cloud Platform (GCP) or Amazon Web Services (AWS). See documentation for <a href="https://cloud.google.com/compute/docs/disks#pd_encryption">GCP persistent disk encryption</a> or <a href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html">AWS elastic block storage</a>.
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
  <td rowspan="3"><a href="network-security.html">Network Security</a></td>
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
  <td>CockroachDB, as a disributed-from-the-ground-up SQL database, is uniquely resilient by nature. A cluster can tolerate node-failures as long as the majority of nodes remain functional. Large, well distributed clusters deployed in reliable infrastructure across multiple regions of the globe&mdash;such as those operated by Cockroach Labs, can be highly resilient even in the face of catastrophic infrastructure failures.</td>
 </tr>
</table>

