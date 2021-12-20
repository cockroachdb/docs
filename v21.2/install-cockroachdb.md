---
title: Install CockroachDB
summary: Install CockroachDB on Mac, Linux, or Windows. Sign up for product release notes.
toc: false
feedback: false
---

<script>
$(document).ready(function(){
    // Detect OS and redirect to corresponding install page by default.
    if (navigator.userAgent.indexOf("Linux") !== -1) {
        location = 'install-cockroachdb-linux.html';
    } else if (navigator.userAgent.indexOf("Win") !== -1) {
        location = 'install-cockroachdb-windows.html';
    } else {
        location = 'install-cockroachdb-mac.html';
    }
});
</script>
