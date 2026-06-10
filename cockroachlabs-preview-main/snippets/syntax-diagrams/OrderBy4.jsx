export const OrderBy4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="201" width="709" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon>
<rect height="32" rx="10" width="68" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="68" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">ORDER</text>
<rect height="32" rx="10" width="38" x="119" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="117" y="45"></rect>
<text class="terminal" x="127" y="65">BY</text><a xlink:href="/docs/v24.3/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="217" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="215" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="227" y="65">a_expr</text></a><rect height="32" rx="10" width="46" x="321" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="319" y="77"></rect>
<text class="terminal" x="329" y="97">ASC</text>
<rect height="32" rx="10" width="56" x="321" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="319" y="121"></rect>
<text class="terminal" x="329" y="141">DESC</text>
<rect height="32" rx="10" width="64" x="437" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="435" y="77"></rect>
<text class="terminal" x="445" y="97">NULLS</text>
<rect height="32" rx="10" width="60" x="541" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="539" y="77"></rect>
<text class="terminal" x="549" y="97">FIRST</text>
<rect height="32" rx="10" width="54" x="541" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="539" y="121"></rect>
<text class="terminal" x="549" y="141">LAST</text><a xlink:href="/docs/v24.3/sql-grammar#sortby_index" xlink:title="sortby_index">
<rect height="32" width="102" x="217" y="167"></rect>
<rect class="nonterminal" height="32" width="102" x="215" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="227" y="185">sortby_index</text></a><rect height="32" rx="10" width="24" x="197" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="195" y="1"></rect>
<text class="terminal" x="205" y="21">,</text>
<path class="line" d="m17 61 h2 m0 0 h10 m68 0 h10 m0 0 h10 m38 0 h10 m40 0 h10 m64 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m46 0 h10 m0 0 h10 m-86 -10 v20 m96 0 v-20 m-96 20 v24 m96 0 v-24 m-96 24 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m40 -76 h10 m0 0 h194 m-224 0 h20 m204 0 h20 m-244 0 q10 0 10 10 m224 0 q0 -10 10 -10 m-234 10 v12 m224 0 v-12 m-224 12 q0 10 10 10 m204 0 q10 0 10 -10 m-214 10 h10 m64 0 h10 m20 0 h10 m60 0 h10 m-100 0 h20 m80 0 h20 m-120 0 q10 0 10 10 m100 0 q0 -10 10 -10 m-110 10 v24 m100 0 v-24 m-100 24 q0 10 10 10 m80 0 q10 0 10 -10 m-90 10 h10 m54 0 h10 m0 0 h6 m-424 -76 h20 m444 0 h20 m-484 0 q10 0 10 10 m464 0 q0 -10 10 -10 m-474 10 v100 m464 0 v-100 m-464 100 q0 10 10 10 m444 0 q10 0 10 -10 m-454 10 h10 m102 0 h10 m0 0 h322 m-484 -120 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m484 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-484 0 h10 m24 0 h10 m0 0 h440 m23 44 h-3"></path>
<polygon points="699 61 707 57 707 65"></polygon>
<polygon points="699 61 691 57 691 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
