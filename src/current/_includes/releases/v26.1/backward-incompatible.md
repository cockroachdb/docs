{% comment %}
NOTE: Based on review of v26.1 testing releases, there appear to be no significant backward-incompatible changes from v25.4 to v26.1.

Most changes found were:
1. Changes within v26.1 development (not affecting v25.4 users)
2. Optional/Limited Access features (opt-in)
3. New features with new privilege requirements (not breaking existing functionality)

The cluster settings with changed defaults should be reviewed to confirm none are backward-incompatible.
{% endcomment %}

{% comment %}TODO: Review cluster setting default changes for backward-incompatible impact{% endcomment %}

{% comment %}TODO: Get engineering verification on log.channel_compatibility_mode.enabled default change{% endcomment %}

{% comment %}TODO: Coordinate with Release Engineering on any known backward-incompatible changes{% endcomment %}

{% comment %}
If no backward-incompatible changes are found after review, consider using:
"There are no backward-incompatible changes in v26.1.0."
or removing this section entirely and not including it in v26.1.0.md
{% endcomment %}
