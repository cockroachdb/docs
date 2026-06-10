export const IntervalValue = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="469" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="88" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">INTERVAL</text>
<rect height="32" rx="10" width="76" x="159" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="157" y="1"></rect>
<text class="terminal" x="167" y="21">SCONST</text><a xlink:href="#opt_interval_qualifier" xlink:title="opt_interval_qualifier">
<rect height="32" width="156" x="255" y="3"></rect>
<rect class="nonterminal" height="32" width="156" x="253" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="10" class="nonterminal" x="265" y="21">opt_interval_qualifier</text></a><rect height="32" rx="10" width="26" x="159" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="157" y="45"></rect>
<text class="terminal" x="167" y="65">(</text>
<rect height="32" rx="10" width="74" x="205" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="203" y="45"></rect>
<text class="terminal" x="213" y="65">ICONST</text>
<rect height="32" rx="10" width="26" x="299" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="297" y="45"></rect>
<text class="terminal" x="307" y="65">)</text>
<rect height="32" rx="10" width="76" x="345" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="343" y="45"></rect>
<text class="terminal" x="353" y="65">SCONST</text>
<path class="line" d="m17 17 h2 m0 0 h10 m88 0 h10 m20 0 h10 m76 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m-302 0 h20 m282 0 h20 m-322 0 q10 0 10 10 m302 0 q0 -10 10 -10 m-312 10 v24 m302 0 v-24 m-302 24 q0 10 10 10 m282 0 q10 0 10 -10 m-292 10 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m76 0 h10 m23 -44 h-3"></path>
<polygon points="459 17 467 13 467 21"></polygon>
<polygon points="459 17 451 13 451 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
