export const StorageParameter = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="385" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
text {
  fill: #2f3337;
  font-size: 14px;
}
rect {
  fill: #ffffff;
  stroke: #3a3d40;
  stroke-width: 2;
}
rect.terminal {
  fill: #ffffff;
}
rect.nonterminal {
  fill: #ffffff;
}
text.terminal {
  fill: #2f3337;
  font-weight: 600;
}
text.nonterminal {
  fill: #2563eb;
}
a text.nonterminal {
  text-decoration: underline;
}
path.line {
  fill: none;
  stroke: #3a3d40;
  stroke-width: 2;
}
polygon {
  fill: #2f3337;
  stroke: #2f3337;
}</style>
<polygon points="9 17 1 13 1 21"></polygon>
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#storage_parameter_key" xlink:title="storage_parameter_key">
<rect height="32" width="174" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="174" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="11" class="nonterminal" x="41" y="21">storage_parameter_key</text></a><rect height="32" rx="10" width="30" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">=</text><a xlink:href="#var_value" xlink:title="var_value">
<rect height="32" width="82" x="275" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="273" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="285" y="21">var_value</text></a><path class="line" d="m17 17 h2 m0 0 h10 m174 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m82 0 h10 m3 0 h-3"></path>
<polygon points="375 17 383 13 383 21"></polygon>
<polygon points="375 17 367 13 367 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
