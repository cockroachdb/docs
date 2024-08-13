{% comment %}

This utility include checks the support status of the
major version that you pass to it by looking in versions.csv.
This include can work on a versioned page by using page.version.version
instead of a literal string. For usage, refer to the bottom of this file.
{% endcomment %}

{% assign DEBUG = false %}

{% comment %}NO EDITS BELOW THIS LINE unless you know what you're doing.{% endcomment %}

{% if include.major_version == blank %}
Error: No major version included. Check {{ page.path }}. Giving up checking for version support.
  {% break %}
{% else %}
  {% unless include.major_version contains "v" %}
Error: include.major_version does not start with "v". Check {{ page.path }}. Giving up checking for version support.
    {% break %}
  {% endunless %}
{% endif %}

{% if DEBUG == true %}
Major version: {{ include.major_version }}<br />
major_version_numeric: {{ major_version_numeric }}<br />
{% endif %}

{% assign version = site.data.versions | where_exp: "rd", "rd.major_version == include.major_version" | first %}

{% if version == blank %}
Error: Major version {{ include.major_version }} not found. Check src/current/_data/versions.csv. Giving up checking for version support.
  {% break %}
{% endif %}

{% if DEBUG == true %}
Version object: {{ version }}<br />
{% endif %}

{% assign released = 0 %}
{% assign supported = 0 %}

{% if DEBUG == true %}
supported: {{ supported }}<br />
{% endif %}

{% if version.release_date != "N/A" %}
  {% assign released = 1 %}
  {% if version.lts_asst_supp_exp_date != "N/A" %}
    {% assign eol_date = version.lts_asst_supp_exp_date %}
  {% elsif version.asst_supp_exp_date != "N/A" %}
    {% assign eol_date = version.asst_supp_exp_date %}
  {% elsif version.asst_supp_exp_date == "N/A" %}}
    {% assign eol_date = version.maint_supp_exp_date %}
  {% else %}

  {% endif %}
{% endif %}

{% if eol_date == blank and released == true %}
Error: Could not determine EOL date for {{ include.major_version }}. Check versions.csv.
  {% break %}
{% endif %}

{% assign today = "today" |date: "%s" %}

{% if released == 1 %}
  {% assign eol_date_seconds = eol_date | date: "%s" %}
  {% comment %}Convert the EOL date to a nicer format for display{% endcomment %}
  {% capture eol_date_pretty %}{{ eol_date_seconds | date_to_long_string: "ordinal", "US" }}{% endcapture %}
{% endif %}

{% if DEBUG == true %}
released: {{ released }}<br />
lts: {{ lts }}<br />
skippable: {{ skippable }}<br />
today seconds: {{ today }}<br />
eol_date: {{ eol_date }}<br />
eol_date_pretty: {{ eol_date_pretty }}<br />
eol_date_seconds: {{ eol_date_seconds }}<br />
{% endif %}


{% if released == 1 and today <= eol_date_seconds %}
  {% assign supported = 1 %}
{% endif %}

{% if DEBUG == true %}
supported: {{ supported }}<br />
eol_date: {{ eol_date }}<br />
{% endif %}

{% capture support_status_string %}{{ released }},{{ supported }},{{ eol_date_pretty }}{% endcapture %}

{% if DEBUG == true %}
support status string: {{ support_status_string }}<br /><br />
{% endif %}{{ support_status_string | strip_newlines | strip }}

{% comment %}
USAGE OF THIS INCLUDE:

1. Assign a variable for the major version to pass to the include,
using a variable or a literal. Your variable can have any name.
Do not omit the "v".

  Two examples:

  {% assign majorversion = page.version.version %}

  {% assign majorversion="v24.2" %}

2. Call the include within a capture statement. This will save
the result to a string variable rather than displaying it on the page.
Your variable will now contain three fields:
  your_result_object[0]: release status string (not integer), either 0 or 1
  your_result_object[1]: support status string (not integer), either 0 or 1
  your_result_object[2]: EOL date string if released is "1"

  {% capture your_result_object %}{% include version-support-status.md major_version=page.version.version %}{% endcapture %}

3. Assign the result string to an array, then assign the array elements to individual variables.
   It's better to cast the first to integers instead of leaving them as strings. If you leave them as strings, quote the 0s or 1s
   you are comparing them against in step 4.

  {% assign support_status_array = support_status_string | split: ',' %}
  {% assign released = support_status_array[0] | to_integer %}
  {% assign supported = support_status_array[1] | to_integer %}
  {% assign eol_date = support_status_array[2] %}

4. Use the variables in logic on the page. Depending on what you are doing, it may be best to capture your sentence
    into a variable, and strip newlines before you display it. Refer to the full example below.

  {% if released == 1 %}
    {{ majorversion }} is supported.
  {% elsif supported == 0 %}
    {{ majorversion }} is unsupported because it's EOL as of {{your_result_variable[3]}}.
  {% elsif released == 0 %}
    {{ majorversion }} is unsupported because it's a testing release.
  {% endif %}

FULL EXAMPLE
===============
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


END DOCS
{% endcomment %}
