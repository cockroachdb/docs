export const CreateTrigger4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="365" width="707" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="80" x="123" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="121" y="45"></rect>
<text class="terminal" x="131" y="65">TRIGGER</text>
<rect height="32" width="154" x="223" y="47"></rect>
<rect class="nonterminal" height="32" width="154" x="221" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="233" y="65">trigger_create_name</text><rect height="32" rx="10" width="74" x="417" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="415" y="45"></rect>
<text class="terminal" x="425" y="65">BEFORE</text>
<rect height="32" rx="10" width="62" x="417" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="415" y="89"></rect>
<text class="terminal" x="425" y="109">AFTER</text>
<rect height="32" rx="10" width="70" x="571" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="569" y="45"></rect>
<text class="terminal" x="579" y="65">INSERT</text>
<rect height="32" rx="10" width="70" x="571" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="569" y="89"></rect>
<text class="terminal" x="579" y="109">DELETE</text>
<rect height="32" rx="10" width="74" x="571" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="569" y="133"></rect>
<text class="terminal" x="579" y="153">UPDATE</text>
<rect height="32" rx="10" width="40" x="551" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="549" y="1"></rect>
<text class="terminal" x="559" y="21">OR</text>
<rect height="32" rx="10" width="40" x="25" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="23" y="199"></rect>
<text class="terminal" x="33" y="219">ON</text><a xlink:href="/docs/v25.4/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="85" y="201"></rect>
<rect class="nonterminal" height="32" width="96" x="83" y="199"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="95" y="219">table_name</text></a><rect height="32" rx="10" width="48" x="221" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="219" y="231"></rect>
<text class="terminal" x="229" y="251">FOR</text>
<rect height="32" rx="10" width="56" x="309" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="307" y="263"></rect>
<text class="terminal" x="317" y="283">EACH</text>
<rect height="32" rx="10" width="54" x="405" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="403" y="231"></rect>
<text class="terminal" x="413" y="251">ROW</text>
<rect height="32" rx="10" width="62" x="519" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="517" y="231"></rect>
<text class="terminal" x="527" y="251">WHEN</text><a xlink:href="/docs/v25.4/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="601" y="233"></rect>
<rect class="nonterminal" height="32" width="64" x="599" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="611" y="251">a_expr</text></a><rect height="32" rx="10" width="80" x="133" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="131" y="329"></rect>
<text class="terminal" x="141" y="349">EXECUTE</text>
<rect height="32" rx="10" width="92" x="233" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="231" y="329"></rect>
<text class="terminal" x="241" y="349">FUNCTION</text><a xlink:href="/docs/v25.4/sql-grammar#func_name" xlink:title="func_name">
<rect height="32" width="90" x="345" y="331"></rect>
<rect class="nonterminal" height="32" width="90" x="343" y="329"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="11" class="nonterminal" x="355" y="349">func_name</text></a><rect height="32" rx="10" width="26" x="455" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="453" y="329"></rect>
<text class="terminal" x="463" y="349">(</text><a xlink:href="/docs/v25.4/sql-grammar#trigger_func_args" xlink:title="trigger_func_args">
<rect height="32" width="132" x="501" y="331"></rect>
<rect class="nonterminal" height="32" width="132" x="499" y="329"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="10" class="nonterminal" x="511" y="349">trigger_func_args</text></a><rect height="32" rx="10" width="26" x="653" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="651" y="329"></rect>
<text class="terminal" x="661" y="349">)</text>
<path class="line" d="m17 61 h2 m0 0 h10 m72 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m154 0 h10 m20 0 h10 m74 0 h10 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m62 0 h10 m0 0 h12 m60 -44 h10 m70 0 h10 m0 0 h4 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m70 0 h10 m0 0 h4 m-104 -10 v20 m114 0 v-20 m-114 20 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m74 0 h10 m-134 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m134 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-134 0 h10 m40 0 h10 m0 0 h74 m22 44 l2 0 m2 0 l2 0 m2 0 l2 0 m-704 154 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m40 0 h10 m0 0 h10 m96 0 h10 m20 0 h10 m0 0 h248 m-278 0 h20 m258 0 h20 m-298 0 q10 0 10 10 m278 0 q0 -10 10 -10 m-288 10 v12 m278 0 v-12 m-278 12 q0 10 10 10 m258 0 q10 0 10 -10 m-268 10 h10 m48 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m20 -32 h10 m54 0 h10 m40 -32 h10 m0 0 h156 m-186 0 h20 m166 0 h20 m-206 0 q10 0 10 10 m186 0 q0 -10 10 -10 m-196 10 v12 m186 0 v-12 m-186 12 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m62 0 h10 m0 0 h10 m64 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-596 130 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m80 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m132 0 h10 m0 0 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="697 345 705 341 705 349"></polygon>
<polygon points="697 345 689 341 689 349"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
