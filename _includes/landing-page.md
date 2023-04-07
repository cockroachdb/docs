<div class="mb-xl-5 bg-cover bg-cover__bg-early-3-1">
    <div class="p-2 p-md-5">
    <h1 class="m-0 text-white">{{ page.title }}</h1>
    <p class="mt-0 pb-4 text-white">{{ page.summary }}</p>
      <div class="row d-lg-flex mx-0">
      {% for card in site.data.cards.[page.docs_area] %}
        <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
          <div class="card card-link h-100 d-flex">
          <a href="{{ card.link | relative_url }}" class="h-100">
            <div class="card-body p-4 flex-column justify-content-center align-items-left h-100 card-header-overlap">
              {% if card.icon %}
              <img class="m-0 mb-4 mt-auto" src="{{ card.icon | relative_url }}" alt="link icon" />
              {% endif %}
              <h6 class="mt-2 mt-0 text-black">{{ card.title }}</h6>
              <p class="text-black">{{ card.text | default: "nbsp;" }}</p>
              <h4 class="mb-0 text-electric-purple font-poppins-sb">Learn more <img class="m-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}" alt="arrow right"/></h4>
            </div>
            </a>
          </div>
        </div>
      {% endfor %}
      </div>
    </div>
</div>
