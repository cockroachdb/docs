{{site.data.alerts.callout_info}}
Parameters should always be URI-encoded before they are included the changefeed's URI, as they often contain special characters. Use Javascript's [encodeURIComponent](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) function or Go language's [url.QueryEscape](https://golang.org/pkg/net/url/#QueryEscape) function to URI-encode the parameters. Other languages provide similar functions to URI-encode special characters.
{{site.data.alerts.end}}
