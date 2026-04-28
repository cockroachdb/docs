export const Check6 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="277" width="631" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">CREATE</text>
<rect height="32" rx="10" width="62" x="123" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="121" y="45"></rect>
<text class="terminal" x="131" y="65">TABLE</text>
<rect height="32" width="96" x="205" y="47"></rect>
<rect class="nonterminal" height="32" width="96" x="203" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="215" y="65">table_name</text><rect height="32" rx="10" width="26" x="321" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="319" y="45"></rect>
<text class="terminal" x="329" y="65">(</text><a xlink:href="/docs/v24.1/sql-grammar#column_table_def" xlink:title="column_table_def">
<rect height="32" width="134" x="387" y="47"></rect>
<rect class="nonterminal" height="32" width="134" x="385" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="397" y="65">column_table_def</text></a><rect height="32" rx="10" width="24" x="387" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="385" y="1"></rect>
<text class="terminal" x="395" y="21">,</text>
<rect height="32" rx="10" width="110" x="45" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="43" y="143"></rect>
<text class="terminal" x="53" y="163">CONSTRAINT</text><a xlink:href="/docs/v24.1/sql-grammar#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="175" y="145"></rect>
<rect class="nonterminal" height="32" width="126" x="173" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="185" y="163">constraint_name</text></a><rect height="32" rx="10" width="64" x="341" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="339" y="111"></rect>
<text class="terminal" x="349" y="131">CHECK</text>
<rect height="32" rx="10" width="26" x="425" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="423" y="111"></rect>
<text class="terminal" x="433" y="131">(</text>
<rect height="32" width="92" x="471" y="113"></rect>
<rect class="nonterminal" height="32" width="92" x="469" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="481" y="131">check_expr</text><rect height="32" rx="10" width="26" x="583" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="581" y="111"></rect>
<text class="terminal" x="591" y="131">)</text>
<rect height="32" width="130" x="407" y="243"></rect>
<rect class="nonterminal" height="32" width="130" x="405" y="241"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="417" y="261">table_constraints</text><rect height="32" rx="10" width="26" x="577" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="575" y="209"></rect>
<text class="terminal" x="585" y="229">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m72 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m134 0 h10 m-174 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m154 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-154 0 h10 m24 0 h10 m0 0 h110 m22 44 l2 0 m2 0 l2 0 m2 0 l2 0 m-560 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h266 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v12 m296 0 v-12 m-296 12 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m110 0 h10 m0 0 h10 m126 0 h10 m20 -32 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-266 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m20 -32 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="621 225 629 221 629 229"></polygon>
<polygon points="621 225 613 221 613 229"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
