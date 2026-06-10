export const WindowDefinition = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="399" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#window_name" xlink:title="window_name">
<rect height="32" width="110" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="110" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="12" class="nonterminal" x="41" y="21">window_name</text></a><rect height="32" rx="10" width="38" x="161" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="159" y="1"></rect>
<text class="terminal" x="169" y="21">AS</text><a xlink:href="#window_specification" xlink:title="window_specification">
<rect height="32" width="152" x="219" y="3"></rect>
<rect class="nonterminal" height="32" width="152" x="217" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="10" class="nonterminal" x="229" y="21">window_specification</text></a><path class="line" d="m17 17 h2 m0 0 h10 m110 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m152 0 h10 m3 0 h-3"></path>
<polygon points="389 17 397 13 397 21"></polygon>
<polygon points="389 17 381 13 381 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
