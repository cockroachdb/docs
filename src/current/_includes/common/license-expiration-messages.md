Depending on the status of your cluster's [license]({% link {{ page.version.version }}/licensing-faqs.md %}), the following messages may be displayed in the DB Console:

- If the license will expire soon, the message is: _This cluster will require a license key by ${DATE} or the cluster will be throttled._
- If the license is no longer valid, the message is: _Your license key expired on ${DATE} and the cluster was throttled. Please add a license key to continue using this cluster._
- If the cluster is required to send telemetry but has not been sending it, the message is: _Telemetry has not been received from some nodes in this cluster since ${DATE}. These nodes will be throttled on ${DATE} unless telemetry is received._

For instructions on how to obtain and set a license, see [Obtain a license]({% link {{ page.version.version }}/licensing-faqs.md %}#obtain-a-license).

For more information about throttling and telemetry, see [What is throttling and how does it work?]({% link {{ page.version.version }}/licensing-faqs.md %}#throttling)
