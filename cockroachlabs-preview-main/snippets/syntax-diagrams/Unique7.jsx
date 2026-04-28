export const Unique7 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="321" width="627" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="329" y="65">(</text><a xlink:href="/docs/v24.3/sql-grammar#column_table_def" xlink:title="column_table_def">
<rect height="32" width="134" x="387" y="47"></rect>
<rect class="nonterminal" height="32" width="134" x="385" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="397" y="65">column_table_def</text></a><rect height="32" rx="10" width="24" x="387" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="385" y="1"></rect>
<text class="terminal" x="395" y="21">,</text>
<rect height="32" rx="10" width="110" x="45" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="43" y="187"></rect>
<text class="terminal" x="53" y="207">CONSTRAINT</text><a xlink:href="/docs/v24.3/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="175" y="189"></rect>
<rect class="nonterminal" height="32" width="56" x="173" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="185" y="207">name</text></a><rect height="32" rx="10" width="74" x="271" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="269" y="155"></rect>
<text class="terminal" x="279" y="175">UNIQUE</text>
<rect height="32" rx="10" width="26" x="365" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="363" y="155"></rect>
<text class="terminal" x="373" y="175">(</text><a xlink:href="/docs/v24.3/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="431" y="157"></rect>
<rect class="nonterminal" height="32" width="108" x="429" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="441" y="175">column_name</text></a><rect height="32" rx="10" width="24" x="431" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="429" y="111"></rect>
<text class="terminal" x="439" y="131">,</text>
<rect height="32" rx="10" width="26" x="579" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="577" y="155"></rect>
<text class="terminal" x="587" y="175">)</text>
<rect height="32" width="130" x="403" y="287"></rect>
<rect class="nonterminal" height="32" width="130" x="401" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="413" y="305">table_constraints</text><rect height="32" rx="10" width="26" x="573" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="571" y="253"></rect>
<text class="terminal" x="581" y="273">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m72 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m134 0 h10 m-174 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m154 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-154 0 h10 m24 0 h10 m0 0 h110 m22 44 l2 0 m2 0 l2 0 m2 0 l2 0 m-560 110 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h196 m-226 0 h20 m206 0 h20 m-246 0 q10 0 10 10 m226 0 q0 -10 10 -10 m-236 10 v12 m226 0 v-12 m-226 12 q0 10 10 10 m206 0 q10 0 10 -10 m-216 10 h10 m110 0 h10 m0 0 h10 m56 0 h10 m20 -32 h10 m74 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m108 0 h10 m-148 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m128 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-128 0 h10 m24 0 h10 m0 0 h84 m20 44 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-266 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m20 -32 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="617 269 625 265 625 273"></polygon>
<polygon points="617 269 609 265 609 273"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
