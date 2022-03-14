---
title: How to Choose a Deployment Strategy
summary: Learn how to choose between CockroachDB Serverless, Dedicated, and Self-Hosted deployment strategies.
toc: true
docs_area: deploy
---

Cockroach Labs offers three ways to use and deploy CockroachDB: two managed services -- CockroachDB Serverless and CockroachDB Dedicated -- and a self managed option -- CockroachDB Self-Hosted. To help you choose which option would best satisfy your requirements, this page describes use cases for each option and lists the features that support the use cases.

<table>
  <tr>
    <th><b>Use cases</b></th>
    <th><b>Deployment type</b></th>
    <th><b>Features</b></th>
  </tr>
  <tr>
      <td><ul>
        <li>Starter projects and evaluations.</li>
        <li>Only need a single region.</li>
      </ul></td>
      <td><ul>
        <li><b>CockroachDB Serverless (beta)</b>: A multi-tenant CockroachDB deployment, managed by Cockroach Labs, in a single region and cloud (AWS or GCP). CockroachDB Serverless lets you create and start clusters instantly.</li>
      </ul></td>
      <td><ul>
        <li><b>Isolation</b>: Shared CockroachDB software and infrastructure. Data is is not shared between deployments.</li>
        <li><b>CockroachDB version</b>: Managed by Cockroach Labs and upgraded periodically.</li>
        <li><b>Operations</b>: Cockroach Labs SRE provides guaranteed uptime and backups every three hours.</li>
        <li><b>Scaling</b>: By increasing spend limits in Cloud Console.</li>
        <li><b>Cost</b>: Free for 5GiB of storage and 250M <a href="../cockroachcloud/serverless-faqs.html#what-is-a-request-unit">Request Units</a>. Consumption based billing and spend limits enforce budget requirements.</li>
        <li><b>Support</b>: Provided by CockroachDB <a href="https://forum.cockroachlabs.com/">community forum</a> and <a href="https://cockroachdb.slack.com/">Slack instance</a>.</li>
        <li><b>Enterprise features</b>: ✗</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>Mission-critical databases.</li>
        <li>Future need to add new resources to expand application service.</li>
        <li>Future need to add new regions to serve customers in new markets.</li>
        <li>Require Enterprise features.</li>
      </ul></td>
      <td><ul>
        <li><b>CockroachDB Dedicated</b>: A single tenant CockroachDB deployment, managed by Cockroach Labs, in a single, multi-region cloud (AWS or GCP).</li>
      </ul></td>
      <td><ul>
        <li><b>Isolation</b>: Own instance of CockroachDB software and infrastructure.</li>
        <li><b>CockroachDB version</b>: Choose when creating a cluster.</li>
        <li><b>Operations</b>: Cockroach Labs SRE provides guaranteed uptime, optimization, security, and operations for cluster, node, and cloud instances with daily and hourly backups.</li>
        <li><b>Scaling</b>: By adding nodes in Cloud Console.</li>
        <li><b>Cost</b>: Per node, cloud instances, and cluster SRE all inclusive. Cockroach Labs packages all the costs of hardware, IOPs, network, load balancers, and the SRE resources required to manage the environment in one price so you have a firm understanding and predictability of your database costs.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b>Enterprise features</b>:  ✓ See <a href="enterprise-licensing.html">Enterprise Features</a>.</li>
      </ul></td>
  </tr>
  <tr>
      <td><ul>
        <li>Require complete control over the database environment.</li>
        <li>Run in multi-cloud and inter-cloud deployments.</li>
        <li>Run in a cloud, e.g. Azure, not supported by managed services.</li>
        <li>Require Enterprise features.</li>
      </ul></td>
      <td><ul>
        <li><b>CockroachDB Self-Hosted</b>: A self-managed CockroachDB deployment, backed by Cockroach Labs Support, for multiple clouds and regions.</li>
      </ul></td>
      <td><ul>
        <li><b>Isolation</b>: Own instance of CockroachDB software and infrastructure.</li>
        <li><b>CockroachDB version</b>: Choose when installing CockroachDB.</li>
        <li><b>Operations</b>: Self deployed and managed. Manual scaling.</li>
        <li><b>Scaling</b>: By adding nodes and clusters in DB Console.</li>
        <li><b>Cost</b>: Per vCPU on any cloud or infrastructure type.</li>
        <li><b>Support</b>: Enterprise grade <a href="https://support.cockroachlabs.com/">support</a> provided by Cockroach Labs.</li>
        <li><b>Enterprise features</b>:  ✓ See <a href="enterprise-licensing.html">Enterprise Features</a>.</li>
      </ul></td>
  </tr>
</table>

## See also

- [CockroachDB deployment](glossary.html#cockroachdb-deployment)
- [CockroachDB pricing](https://www.cockroachlabs.com/get-started-cockroachdb/)
- [CockroachDB Cloud FAQs](../cockroachcloud/serverless-faqs.html)
- [CockroachDB Cloud Architecture](../cockroachcloud/architecture.html)
- [Manual Deployment](manual-deployment.html)
- [Kubernetes Deployment](kubernetes-overview.html)
