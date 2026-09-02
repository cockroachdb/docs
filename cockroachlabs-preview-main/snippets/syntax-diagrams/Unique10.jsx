export const Unique10 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="217" width="745" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="62" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">TABLE</text>
<rect height="32" width="96" x="205" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="203" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="215" y="21">table_name</text><rect height="32" rx="10" width="26" x="321" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="319" y="1"></rect>
<text class="terminal" x="329" y="21">(</text>
<rect height="32" width="108" x="367" y="3"></rect>
<rect class="nonterminal" height="32" width="108" x="365" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="377" y="21">column_name</text>
<rect height="32" width="100" x="495" y="3"></rect>
<rect class="nonterminal" height="32" width="100" x="493" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="11" class="nonterminal" x="505" y="21">column_type</text><rect height="32" rx="10" width="74" x="615" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="613" y="1"></rect>
<text class="terminal" x="623" y="21">UNIQUE</text><a xlink:href="/docs/v25.2/sql-grammar#column_constraints" xlink:title="column_constraints">
<rect height="32" width="144" x="45" y="117"></rect>
<rect class="nonterminal" height="32" width="144" x="43" y="115"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="10" class="nonterminal" x="55" y="135">column_constraints</text></a><rect height="32" rx="10" width="24" x="269" y="85"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="267" y="83"></rect>
<text class="terminal" x="277" y="103">,</text><a xlink:href="/docs/v25.2/sql-grammar#column_table_def" xlink:title="column_table_def">
<rect height="32" width="134" x="313" y="85"></rect>
<rect class="nonterminal" height="32" width="134" x="311" y="83"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="323" y="103">column_table_def</text></a>
<rect height="32" width="130" x="527" y="117"></rect>
<rect class="nonterminal" height="32" width="130" x="525" y="115"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="537" y="135">table_constraints</text><rect height="32" rx="10" width="26" x="697" y="85"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="695" y="83"></rect>
<text class="terminal" x="705" y="103">)</text>
<rect height="32" rx="10" width="26" x="691" y="183"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="689" y="181"></rect>
<text class="terminal" x="699" y="201">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m100 0 h10 m0 0 h10 m74 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-708 82 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h154 m-184 0 h20 m164 0 h20 m-204 0 q10 0 10 10 m184 0 q0 -10 10 -10 m-194 10 v12 m184 0 v-12 m-184 12 q0 10 10 10 m164 0 q10 0 10 -10 m-174 10 h10 m144 0 h10 m60 -32 h10 m24 0 h10 m0 0 h10 m134 0 h10 m-218 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m198 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-198 0 h10 m0 0 h188 m-238 32 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v14 m258 0 v-14 m-258 14 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m0 0 h228 m40 -34 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m130 0 h10 m20 -32 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-76 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="735 197 743 193 743 201"></polygon>
<polygon points="735 197 727 193 727 201"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
