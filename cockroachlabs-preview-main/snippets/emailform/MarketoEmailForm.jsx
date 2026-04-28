export const MarketoEmailForm = ({ successMessage = "Thanks!" }) => {
  useEffect(() => {
    function initializeReleaseNotesSignup() {
      if (window.__cockroachReleaseNotesSignupInitialized) {
        if (window.__cockroachReleaseNotesRefresh) {
          window.__cockroachReleaseNotesRefresh();
        }
        return;
      }

  window.__cockroachReleaseNotesSignupInitialized = true;

  const MARKETO_BASE_URL = "https://go.cockroachlabs.com";
  const MARKETO_MUNCHKIN_ID = "350-QIN-827";
  const MARKETO_FORMS_SCRIPT = "https://go.cockroachlabs.com/js/forms2/js/forms2.min.js";
  const RELEASE_NOTES_FORM_ID = 1083;
  const EMAIL_ERROR = "Enter a valid email address.";
  const FORM_LOAD_ERROR = "Unable to load the release notes form. Disable content blockers and try again.";
  const LOCALHOST_ERROR = "Marketo rejects submissions from localhost. Test this form on a deployed preview URL.";
  const SUCCESS_MESSAGE = "Thanks!";
  const WIDGET_SELECTOR = "[data-release-notes-signup]";
  const FORM_MOUNT_ID = "cockroachReleaseNotesFormMount";
  const SUBMIT_FRAME_NAME = "cockroachReleaseNotesSubmitFrame";

  const widgetState = new WeakMap();
  let marketoScriptPromise;
  let marketoFormPromise;
  let activeWidget = null;

  function toSecureMarketoUrl(url) {
    if (typeof url !== "string") {
      return url;
    }

    return url.replace("http://go.cockroachlabs.com", "https://go.cockroachlabs.com");
  }

  function patchMarketoFrameTransport() {
    if (window.__cockroachReleaseNotesFrameTransportPatched || typeof HTMLIFrameElement === "undefined") {
      return;
    }

    const iframeProto = HTMLIFrameElement.prototype;
    const originalSetAttribute = iframeProto.setAttribute;

    iframeProto.setAttribute = function (name, value) {
      if (name === "src") {
        value = toSecureMarketoUrl(value);
      }

      return originalSetAttribute.call(this, name, value);
    };

    const srcDescriptor = Object.getOwnPropertyDescriptor(iframeProto, "src");

    if (srcDescriptor && typeof srcDescriptor.get === "function" && typeof srcDescriptor.set === "function") {
      try {
        Object.defineProperty(iframeProto, "src", {
          configurable: true,
          enumerable: srcDescriptor.enumerable,
          get: function () {
            return srcDescriptor.get.call(this);
          },
          set: function (value) {
            srcDescriptor.set.call(this, toSecureMarketoUrl(value));
          },
        });
      } catch (error) {
        // Keep the setAttribute patch as a fallback if the native setter cannot be redefined.
      }
    }

    window.__cockroachReleaseNotesFrameTransportPatched = true;
  }

  function getState(widget) {
    let state = widgetState.get(widget);

    if (!state) {
      state = {
        error: "",
        isSubmitted: false,
        isSubmitting: false,
        successMessage: widget.getAttribute("data-success-message") || SUCCESS_MESSAGE,
        submitTimeoutId: null,
      };
      widgetState.set(widget, state);
    }

    return state;
  }

  function getElements(widget) {
    return {
      emailInput: widget.querySelector("[data-release-notes-email]"),
      error: widget.querySelector("[data-release-notes-error]"),
      errorText: widget.querySelector("[data-release-notes-error-text]"),
      submitButton: widget.querySelector("[data-release-notes-submit]"),
      success: widget.querySelector("[data-release-notes-success]"),
      successText: widget.querySelector("[data-release-notes-success-text]"),
    };
  }

  function ensureFormMount() {
    let mount = document.getElementById(FORM_MOUNT_ID);

    if (mount) {
      return mount;
    }

    mount = document.createElement("div");
    mount.id = FORM_MOUNT_ID;
    mount.setAttribute("aria-hidden", "true");
    mount.style.display = "none";
    document.body.appendChild(mount);
    return mount;
  }

  function getDomForm(form) {
    const formElement = typeof form.getFormElem === "function" ? form.getFormElem() : null;
    return formElement && formElement[0] ? formElement[0] : formElement;
  }

  function mountMarketoForm(form) {
    const domForm = getDomForm(form);

    if (!domForm || domForm.isConnected) {
      return domForm;
    }

    ensureFormMount().appendChild(domForm);
    return domForm;
  }

  function applyFormValues(form, values) {
    if (typeof form.setValues === "function") {
      form.setValues(values);
      return;
    }

    if (typeof form.vals === "function") {
      form.vals(values);
    }
  }

  function ensureSubmitFrame() {
    let frame = document.querySelector('iframe[name="' + SUBMIT_FRAME_NAME + '"]');

    if (frame) {
      return frame;
    }

    frame = document.createElement("iframe");
    frame.name = SUBMIT_FRAME_NAME;
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.display = "none";
    document.body.appendChild(frame);
    return frame;
  }

  function clearSubmitTimeout(widget) {
    const state = getState(widget);

    if (state.submitTimeoutId) {
      window.clearTimeout(state.submitTimeoutId);
      state.submitTimeoutId = null;
    }
  }

  function forceSecureMarketoFrame() {
    const frame = document.querySelector("#MktoForms2XDIframe");

    if (!frame) {
      return;
    }

    const currentSrc = frame.getAttribute("src") || frame.src;

    if (!currentSrc) {
      return;
    }

    const secureSrc = toSecureMarketoUrl(currentSrc);

    if (secureSrc !== currentSrc) {
      frame.setAttribute("src", secureSrc);
    }
  }

  function ensureSecureMarketoFrame() {
    patchMarketoFrameTransport();
    forceSecureMarketoFrame();

    if (window.__cockroachReleaseNotesFrameObserverInitialized || typeof MutationObserver === "undefined") {
      return;
    }

    const observer = new MutationObserver(function () {
      forceSecureMarketoFrame();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src"],
    });

    window.__cockroachReleaseNotesFrameObserverInitialized = true;
    window.__cockroachReleaseNotesFrameObserver = observer;
  }

  function render(widget) {
    if (!widget || !document.contains(widget)) {
      return;
    }

    const state = getState(widget);
    const elements = getElements(widget);

    if (elements.submitButton) {
      elements.submitButton.disabled = state.isSubmitting;
    }

    if (elements.emailInput) {
      elements.emailInput.setAttribute("aria-invalid", state.error ? "true" : "false");
    }

    if (elements.error) {
      elements.error.hidden = !state.error;
      elements.error.style.display = state.error ? "block" : "none";
    }

    if (elements.errorText) {
      elements.errorText.textContent = state.error;
    }

    if (elements.success) {
      elements.success.hidden = !state.isSubmitted;
      elements.success.style.display = state.isSubmitted ? "block" : "none";
    }

    if (elements.successText) {
      elements.successText.textContent = state.successMessage || SUCCESS_MESSAGE;
    }
  }

  function hideMarketoForm(form) {
    const formElement = form && typeof form.getFormElem === "function" ? form.getFormElem() : null;

    if (!formElement) {
      return;
    }

    if (typeof formElement.hide === "function") {
      formElement.hide();
      return;
    }

    if (formElement[0] && formElement[0].style) {
      formElement[0].style.display = "none";
      return;
    }

    if (formElement.style) {
      formElement.style.display = "none";
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isFormLoadError(error) {
    return Boolean(
      error &&
        typeof error === "object" &&
        (error.code === "marketo_load_failed" ||
          error.code === "marketo_not_available" ||
          error.code === "marketo_form_init_failed")
    );
  }

  function isLocalhost() {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }

  function loadMarketoForms() {
    ensureSecureMarketoFrame();

    if (window.MktoForms2) {
      return Promise.resolve(window.MktoForms2);
    }

    if (!marketoScriptPromise) {
      marketoScriptPromise = new Promise(function (resolve, reject) {
        function finalizeLoad() {
          if (window.MktoForms2) {
            forceSecureMarketoFrame();
            resolve(window.MktoForms2);
            return;
          }

          marketoScriptPromise = null;
          const error = new Error("MktoForms2 did not load.");
          error.code = "marketo_not_available";
          reject(error);
        }

        function handleError() {
          marketoScriptPromise = null;
          const error = new Error("Failed to load Marketo forms.");
          error.code = "marketo_load_failed";
          reject(error);
        }

        const existingScript = document.querySelector('script[src="' + MARKETO_FORMS_SCRIPT + '"]');

        if (existingScript) {
          existingScript.addEventListener("load", finalizeLoad, { once: true });
          existingScript.addEventListener("error", handleError, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = MARKETO_FORMS_SCRIPT;
        script.async = true;
        script.addEventListener("load", finalizeLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });
        document.body.appendChild(script);
      });
    }

    return marketoScriptPromise;
  }

  function attachFormCallbacks(form) {
    if (form.__releaseNotesCallbacksAttached) {
      return;
    }

    form.__releaseNotesCallbacksAttached = true;

    form.onSuccess(function () {
      if (!activeWidget || !document.contains(activeWidget)) {
        return false;
      }

      const state = getState(activeWidget);
      clearSubmitTimeout(activeWidget);
      state.isSubmitting = false;
      state.isSubmitted = true;
      state.error = "";
      state.successMessage = activeWidget.getAttribute("data-success-message") || SUCCESS_MESSAGE;
      render(activeWidget);
      return false;
    });

    form.onValidate(function (isValid) {
      if (isValid || !activeWidget || !document.contains(activeWidget)) {
        return;
      }

      const state = getState(activeWidget);
      clearSubmitTimeout(activeWidget);
      state.isSubmitting = false;
      state.error = EMAIL_ERROR;
      render(activeWidget);
    });
  }

  function ensureForm() {
    if (!marketoFormPromise) {
      marketoFormPromise = loadMarketoForms()
        .then(function (MktoForms2) {
          const existingForm = typeof MktoForms2.getForm === "function" ? MktoForms2.getForm(RELEASE_NOTES_FORM_ID) : null;

          if (existingForm) {
            forceSecureMarketoFrame();
            mountMarketoForm(existingForm);
            hideMarketoForm(existingForm);
            attachFormCallbacks(existingForm);
            ensureSubmitFrame();
            return existingForm;
          }

          return new Promise(function (resolve, reject) {
            MktoForms2.loadForm(MARKETO_BASE_URL, MARKETO_MUNCHKIN_ID, RELEASE_NOTES_FORM_ID, function (form) {
              if (!form) {
                const error = new Error("Marketo form failed to initialize.");
                error.code = "marketo_form_init_failed";
                reject(error);
                return;
              }

              forceSecureMarketoFrame();
              mountMarketoForm(form);
              hideMarketoForm(form);
              attachFormCallbacks(form);
              ensureSubmitFrame();
              resolve(form);
            });
          });
        })
        .catch(function (error) {
          marketoFormPromise = null;
          throw error;
        });
    }

    return marketoFormPromise;
  }

  function handleEmailInput(target) {
    const widget = target.closest(WIDGET_SELECTOR);

    if (!widget) {
      return;
    }

    const state = getState(widget);

    if (!state.error) {
      return;
    }

    state.error = "";
    render(widget);
  }

  function handleSubmit(button) {
    const widget = button.closest(WIDGET_SELECTOR);

    if (!widget) {
      return;
    }

    const state = getState(widget);
    const elements = getElements(widget);

    if (!elements.emailInput) {
      return;
    }

    const email = elements.emailInput.value.trim();

    if (!email) {
      state.error = EMAIL_ERROR;
      render(widget);
      return;
    }

    state.error = "";
    state.isSubmitted = false;
    state.isSubmitting = true;
    state.successMessage = widget.getAttribute("data-success-message") || SUCCESS_MESSAGE;
    render(widget);

    if (!isValidEmail(email)) {
      state.isSubmitting = false;
      state.error = EMAIL_ERROR;
      render(widget);
      return;
    }

    if (isLocalhost()) {
      state.isSubmitting = false;
      state.error = LOCALHOST_ERROR;
      render(widget);
      return;
    }

    activeWidget = widget;

    ensureForm()
      .then(function (form) {
        const formValues = {
          Email: email,
          Send_me_product_and_feature_updates__c: "TRUE",
          subscriptionProductUpdates: "TRUE",
          optin: "TRUE",
        };

        applyFormValues(form, formValues);

        if (typeof form.validate === "function" && !form.validate()) {
          state.isSubmitting = false;
          state.error = EMAIL_ERROR;
          render(widget);
          return;
        }

        clearSubmitTimeout(widget);
        state.submitTimeoutId = window.setTimeout(function () {
          state.isSubmitting = false;
          state.error = EMAIL_ERROR;
          render(widget);
        }, 10000);

        if (typeof form.submit !== "function") {
          throw new Error("marketo_submit_missing");
        }

        form.submit();
      })
      .catch(function (error) {
        clearSubmitTimeout(widget);
        state.isSubmitting = false;
        state.error = isFormLoadError(error) ? FORM_LOAD_ERROR : EMAIL_ERROR;
        render(widget);
      });
  }

  document.addEventListener("click", function (event) {
    const submitButton = event.target.closest("[data-release-notes-submit]");

    if (!submitButton) {
      return;
    }

    event.preventDefault();
    handleSubmit(submitButton);
  });

  document.addEventListener("input", function (event) {
    if (!(event.target instanceof HTMLInputElement) || !event.target.matches("[data-release-notes-email]")) {
      return;
    }

    handleEmailInput(event.target);
  });

  window.__cockroachReleaseNotesRefresh = function () {
    ensureSecureMarketoFrame();
    const widgets = document.querySelectorAll(WIDGET_SELECTOR);

    widgets.forEach(render);

    if (widgets.length > 0) {
      ensureForm().catch(function () {});
    }
  };

      window.__cockroachReleaseNotesRefresh();
    }

    initializeReleaseNotesSignup();
  }, []);

  return (
    <div data-release-notes-signup data-success-message={successMessage} className="not-prose my-4 max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <input
          data-release-notes-email
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Email*"
          aria-label="Email"
          className="min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary dark:border-gray-700 dark:bg-gray-950 dark:text-white"
        />
        <button
          data-release-notes-submit
          type="button"
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Submit
        </button>
      </div>

      <div
        data-release-notes-error
        hidden
        className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        <span data-release-notes-error-text />
      </div>

      <div
        data-release-notes-success
        hidden
        className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200"
      >
        <span data-release-notes-success-text>{successMessage}</span>
      </div>
    </div>
  );
};
