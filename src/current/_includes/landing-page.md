{% assign page_version = page.version.version | replace: site.versions["stable"], "stable" | replace: site.versions["dev"], "dev" %}
<div class="mb-xl-5 bg-cover bg-cover__bg-early-3-1">
    <div class="p-2 p-md-5">
    <p class="mt-0 pb-4 text-white">{{ page.summary }}</p>
      <div class="row d-lg-flex mx-0">
      {% for card in site.data.cards.[page.cards_section] %}
        <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
          <div class="card card-link h-100 d-flex">
            <div class="card-body p-4 flex-column justify-content-center align-items-left h-100 card-header-overlap">
              {% if card.icon %}
              {% endif %}
              <h6 class="mt-2 mt-0 text-black">{{ card.title }}</h6>
              <p class="text-black">{{ card.text | default: "nbsp;" }}</p>
            </div>
            </a>
          </div>
        </div>
      {% endfor %}
      </div>
    </div>
</div>
