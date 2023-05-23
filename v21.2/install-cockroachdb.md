---
title: Install CockroachDB
summary: Install CockroachDB on Mac, Linux, or Windows. Sign up for product release notes.
toc: false
feedback: false
docs_area: deploy
---

<script>
$(document).ready(function(){
    let prefix = "";
    if (location.pathname.endsWith("/")) {
        prefix = "../"
    }
    // Detect OS and redirect to corresponding install page by default.
    if (navigator.userAgent.indexOf("Linux") !== -1) {
        location = prefix.concat('install-cockroachdb-linux.html');
    } else if (navigator.userAgent.indexOf("Win") !== -1) {
        location = prefix.concat('install-cockroachdb-windows.html');
    } else {
        location = prefix.concat('install-cockroachdb-mac.html');
    }
});
</script>
