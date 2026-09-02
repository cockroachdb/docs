export const SearchLink = ({ term, children }) => {
  const handleClick = (e) => {
    e.preventDefault();

    const searchButton = document.querySelector("button#search-bar-entry");
    if (!searchButton) return;

    searchButton.click();

    requestAnimationFrame(() => {
      const input = document.querySelector("input#search-input");
      if (!input) return;

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(input, term);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
  };

  return (
    <a href="#" onClick={handleClick}>
      {children}
    </a>
  );
};
