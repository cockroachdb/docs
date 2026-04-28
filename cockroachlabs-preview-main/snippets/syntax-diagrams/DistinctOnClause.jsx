export const DistinctOnClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="391" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="86" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">DISTINCT</text>
<rect height="32" rx="10" width="40" x="137" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="135" y="1"></rect>
<text class="terminal" x="145" y="21">ON</text>
<rect height="32" rx="10" width="26" x="197" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="195" y="1"></rect>
<text class="terminal" x="205" y="21">(</text><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="243" y="3"></rect>
<rect class="nonterminal" height="32" width="74" x="241" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="253" y="21">expr_list</text></a><rect height="32" rx="10" width="26" x="337" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="335" y="1"></rect>
<text class="terminal" x="345" y="21">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m86 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="381 17 389 13 389 21"></polygon>
<polygon points="381 17 373 13 373 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
