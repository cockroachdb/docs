export const PrimaryRegionClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="465" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="84" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">PRIMARY</text>
<rect height="32" rx="10" width="74" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">REGION</text><a xlink:href="#opt_equal" xlink:title="opt_equal">
<rect height="32" width="84" x="229" y="3"></rect>
<rect class="nonterminal" height="32" width="84" x="227" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="10" class="nonterminal" x="239" y="21">opt_equal</text></a><a xlink:href="#region_name" xlink:title="region_name">
<rect height="32" width="104" x="333" y="3"></rect>
<rect class="nonterminal" height="32" width="104" x="331" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="343" y="21">region_name</text></a><path class="line" d="m17 17 h2 m0 0 h10 m84 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m104 0 h10 m3 0 h-3"></path>
<polygon points="455 17 463 13 463 21"></polygon>
<polygon points="455 17 447 13 447 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
