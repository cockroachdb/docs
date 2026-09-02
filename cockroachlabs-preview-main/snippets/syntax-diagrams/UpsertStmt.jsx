export const UpsertStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="733" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#opt_with_clause" xlink:title="opt_with_clause">
<rect height="32" width="124" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="41" y="21">opt_with_clause</text></a><rect height="32" rx="10" width="74" x="175" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="173" y="1"></rect>
<text class="terminal" x="183" y="21">UPSERT</text>
<rect height="32" rx="10" width="56" x="269" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="267" y="1"></rect>
<text class="terminal" x="277" y="21">INTO</text><a xlink:href="#insert_target" xlink:title="insert_target">
<rect height="32" width="104" x="345" y="3"></rect>
<rect class="nonterminal" height="32" width="104" x="343" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="10" class="nonterminal" x="355" y="21">insert_target</text></a><a xlink:href="#insert_rest" xlink:title="insert_rest">
<rect height="32" width="90" x="469" y="3"></rect>
<rect class="nonterminal" height="32" width="90" x="467" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="479" y="21">insert_rest</text></a><a xlink:href="#returning_clause" xlink:title="returning_clause">
<rect height="32" width="126" x="579" y="3"></rect>
<rect class="nonterminal" height="32" width="126" x="577" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="589" y="21">returning_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m124 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m56 0 h10 m0 0 h10 m104 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m126 0 h10 m3 0 h-3"></path>
<polygon points="723 17 731 13 731 21"></polygon>
<polygon points="723 17 715 13 715 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
