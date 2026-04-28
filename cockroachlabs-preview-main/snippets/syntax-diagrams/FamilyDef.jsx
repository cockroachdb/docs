export const FamilyDef = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="475" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">FAMILY</text><a xlink:href="#opt_family_name" xlink:title="opt_family_name">
<rect height="32" width="130" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="130" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="11" class="nonterminal" x="133" y="21">opt_family_name</text></a><rect height="32" rx="10" width="26" x="273" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="271" y="1"></rect>
<text class="terminal" x="281" y="21">(</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="319" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="317" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="329" y="21">name_list</text></a><rect height="32" rx="10" width="26" x="421" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="419" y="1"></rect>
<text class="terminal" x="429" y="21">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m130 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="465 17 473 13 473 21"></polygon>
<polygon points="465 17 457 13 457 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
