{{site.data.alerts.callout_info}}
If you are using Google Chrome, and you are getting an error about not being able to reach `localhost` because its certificate has been revoked, go to <a href="chrome://flags/#allow-insecure-localhost" data-proofer-ignore>chrome://flags/#allow-insecure-localhost</a>, enable "Allow invalid certificates for resources loaded from localhost", and then restart the browser. Enabling this Chrome feature degrades security for all sites running on `localhost`, not just CockroachDB's Admin UI, so be sure to enable the feature only temporarily.
{{site.data.alerts.end}}
