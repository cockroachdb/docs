Depending on the status of your cluster's [license]({% link "{{ page.version.version }}/licensing-faqs.md" %}), the following messages may be displayed in the DB Console:

- If your cluster was throttled because a valid license key was never added, the message is: _This cluster was throttled because it requires a license key. Please add a license key to continue using this cluster._
- If your cluster has an invalid license key and the cluster is still in the grace period, the message is: _Your license key expired on ${DATE1}. The cluster will be throttled on ${DATE2} unless a new license key is added._
- If your cluster was throttled due to an invalid license, the message is: _Your license key expired on ${DATE} and the cluster was throttled. Please add a license key to continue using this cluster._
- If the cluster is required to send telemetry but has not been sending it, and is not yet being throttled, the message is: _Telemetry has not been received from some nodes in this cluster since ${DATE}. These nodes will be throttled on ${DATE} unless telemetry is received._
- If the cluster is required to send telemetry but has not been sending it, and is currently being throttled, the message is:  _Telemetry has not been received from some nodes in this cluster since ${DATE1}. These nodes were throttled on ${DATE2}._

For instructions on how to obtain and set a license, refer to [Obtain a license]({% link "{{ page.version.version }}/licensing-faqs.md" %}#obtain-a-license).

For more information about throttling and telemetry, refer to [What is throttling and how does it work?]({% link "{{ page.version.version }}/licensing-faqs.md" %}#throttling)
