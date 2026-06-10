export const Numeric = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="477" width="409" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="44" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">INT</text>
<rect height="32" rx="10" width="80" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">INTEGER</text>
<rect height="32" rx="10" width="90" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">SMALLINT</text>
<rect height="32" rx="10" width="70" x="51" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="49" y="133"></rect>
<text class="terminal" x="59" y="153">BIGINT</text>
<rect height="32" rx="10" width="54" x="51" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="49" y="177"></rect>
<text class="terminal" x="59" y="197">REAL</text>
<rect height="32" rx="10" width="64" x="51" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="221"></rect>
<text class="terminal" x="59" y="241">FLOAT</text><a xlink:href="#opt_float" xlink:title="opt_float">
<rect height="32" width="78" x="135" y="223"></rect>
<rect class="nonterminal" height="32" width="78" x="133" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="145" y="241">opt_float</text></a><rect height="32" rx="10" width="76" x="51" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="265"></rect>
<text class="terminal" x="59" y="285">DOUBLE</text>
<rect height="32" rx="10" width="98" x="147" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="145" y="265"></rect>
<text class="terminal" x="155" y="285">PRECISION</text>
<rect height="32" rx="10" width="82" x="71" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="69" y="309"></rect>
<text class="terminal" x="79" y="329">DECIMAL</text>
<rect height="32" rx="10" width="46" x="71" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="69" y="353"></rect>
<text class="terminal" x="79" y="373">DEC</text>
<rect height="32" rx="10" width="84" x="71" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="69" y="397"></rect>
<text class="terminal" x="79" y="417">NUMERIC</text><a xlink:href="#opt_numeric_modifiers" xlink:title="opt_numeric_modifiers">
<rect height="32" width="166" x="195" y="311"></rect>
<rect class="nonterminal" height="32" width="166" x="193" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="205" y="329">opt_numeric_modifiers</text></a><rect height="32" rx="10" width="86" x="51" y="443"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="49" y="441"></rect>
<text class="terminal" x="59" y="461">BOOLEAN</text>
<path class="line" d="m17 17 h2 m20 0 h10 m44 0 h10 m0 0 h266 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m80 0 h10 m0 0 h230 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m90 0 h10 m0 0 h220 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m70 0 h10 m0 0 h240 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m54 0 h10 m0 0 h256 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m64 0 h10 m0 0 h10 m78 0 h10 m0 0 h148 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m76 0 h10 m0 0 h10 m98 0 h10 m0 0 h116 m-340 -10 v20 m350 0 v-20 m-350 20 v24 m350 0 v-24 m-350 24 q0 10 10 10 m330 0 q10 0 10 -10 m-320 10 h10 m82 0 h10 m0 0 h2 m-124 0 h20 m104 0 h20 m-144 0 q10 0 10 10 m124 0 q0 -10 10 -10 m-134 10 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m46 0 h10 m0 0 h38 m-114 -10 v20 m124 0 v-20 m-124 20 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m84 0 h10 m20 -88 h10 m166 0 h10 m-340 -10 v20 m350 0 v-20 m-350 20 v112 m350 0 v-112 m-350 112 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m86 0 h10 m0 0 h224 m23 -440 h-3"></path>
<polygon points="399 17 407 13 407 21"></polygon>
<polygon points="399 17 391 13 391 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
