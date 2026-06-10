export const ReferenceOnUpdate = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="339" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon>
<rect height="32" rx="10" width="40" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">ON</text>
<rect height="32" rx="10" width="74" x="91" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="89" y="1"></rect>
<text class="terminal" x="99" y="21">UPDATE</text><a xlink:href="#reference_action" xlink:title="reference_action">
<rect height="32" width="126" x="185" y="3"></rect>
<rect class="nonterminal" height="32" width="126" x="183" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="195" y="21">reference_action</text></a><path class="line" d="m17 17 h2 m0 0 h10 m40 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m126 0 h10 m3 0 h-3"></path>
<polygon points="329 17 337 13 337 21"></polygon>
<polygon points="329 17 321 13 321 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
