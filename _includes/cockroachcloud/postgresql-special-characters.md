{{site.data.alerts.callout_danger}}
PostgreSQL connection URIs do not support special characters. If you have special characters in your password, you will have to [URL encode](https://www.w3schools.com/tags/ref_urlencode.ASP) them to connect to your cluster (e.g., `password!` should be entered as `password%21`). 
{{site.data.alerts.end}}
