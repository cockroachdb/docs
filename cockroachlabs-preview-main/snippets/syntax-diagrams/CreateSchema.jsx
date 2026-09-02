export const CreateSchema = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="275" width="609" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="72" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">CREATE</text>
<rect height="32" rx="10" width="76" x="125" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="123" y="1"></rect>
<text class="terminal" x="133" y="21">SCHEMA</text>
<rect height="32" rx="10" width="34" x="241" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="239" y="33"></rect>
<text class="terminal" x="249" y="53">IF</text>
<rect height="32" rx="10" width="48" x="295" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="293" y="33"></rect>
<text class="terminal" x="303" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="363" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="361" y="33"></rect>
<text class="terminal" x="371" y="53">EXISTS</text><a xlink:href="/docs/stable/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="45" y="101"></rect>
<rect class="nonterminal" height="32" width="56" x="43" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="55" y="119">name</text></a><rect height="32" rx="10" width="24" x="141" y="133"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="139" y="131"></rect>
<text class="terminal" x="149" y="151">.</text><a xlink:href="/docs/stable/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="185" y="133"></rect>
<rect class="nonterminal" height="32" width="56" x="183" y="131"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="195" y="151">name</text></a><a xlink:href="/docs/stable/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="65" y="209"></rect>
<rect class="nonterminal" height="32" width="56" x="63" y="207"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="75" y="227">name</text></a><rect height="32" rx="10" width="24" x="161" y="241"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="159" y="239"></rect>
<text class="terminal" x="169" y="259">.</text><a xlink:href="/docs/stable/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="205" y="241"></rect>
<rect class="nonterminal" height="32" width="56" x="203" y="239"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="215" y="259">name</text></a><rect height="32" rx="10" width="138" x="321" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="138" x="319" y="175"></rect>
<text class="terminal" x="329" y="195">AUTHORIZATION</text><a xlink:href="/docs/stable/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="479" y="177"></rect>
<rect class="nonterminal" height="32" width="82" x="477" y="175"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="489" y="195">role_spec</text></a><path class="line" d="m19 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m76 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-472 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m56 0 h10 m20 0 h10 m0 0 h110 m-140 0 h20 m120 0 h20 m-160 0 q10 0 10 10 m140 0 q0 -10 10 -10 m-150 10 v12 m140 0 v-12 m-140 12 q0 10 10 10 m120 0 q10 0 10 -10 m-130 10 h10 m24 0 h10 m0 0 h10 m56 0 h10 m20 -32 h300 m-556 0 h20 m536 0 h20 m-576 0 q10 0 10 10 m556 0 q0 -10 10 -10 m-566 10 v56 m556 0 v-56 m-556 56 q0 10 10 10 m536 0 q10 0 10 -10 m-526 10 h10 m0 0 h226 m-256 0 h20 m236 0 h20 m-276 0 q10 0 10 10 m256 0 q0 -10 10 -10 m-266 10 v12 m256 0 v-12 m-256 12 q0 10 10 10 m236 0 q10 0 10 -10 m-246 10 h10 m56 0 h10 m20 0 h10 m0 0 h110 m-140 0 h20 m120 0 h20 m-160 0 q10 0 10 10 m140 0 q0 -10 10 -10 m-150 10 v12 m140 0 v-12 m-140 12 q0 10 10 10 m120 0 q10 0 10 -10 m-130 10 h10 m24 0 h10 m0 0 h10 m56 0 h10 m40 -64 h10 m138 0 h10 m0 0 h10 m82 0 h10 m23 -76 h-3"></path>
<polygon points="599 115 607 111 607 119"></polygon>
<polygon points="599 115 591 111 591 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
