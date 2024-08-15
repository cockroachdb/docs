---
title: Test
toc: false
summary: Test
major_version: v24.1
---

{% capture support_status_string %}{% include version-support-status.md major_version=page.major_version %}{% endcapture %}
{% assign support_status_array = support_status_string | split: ',' %}
{% assign released = support_status_array[0] | to_integer %}
{% assign supported = support_status_array[1] | to_integer %}
{% assign eol_date = support_status_array[2] %}

{% capture status_sentence %}{{ page.major_version }} is
{% if released == 1 and supported == 1 %}
 supported until {{support_status_array[2]}}
{% elsif released == 1 and supported == 0 %}
 EOL as of {{support_status_array[2]}}
{% elsif released == 0 and supported == 0 %}
 a testing release that is not yet released or supported
{% endif %}.{% endcapture %}{{status_sentence | strip_newlines }}
