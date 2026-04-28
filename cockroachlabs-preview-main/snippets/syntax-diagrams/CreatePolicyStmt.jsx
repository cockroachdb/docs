export const CreatePolicyStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="135" width="721" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">POLICY</text>
<rect height="32" rx="10" width="34" x="235" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="233" y="33"></rect>
<text class="terminal" x="243" y="53">IF</text>
<rect height="32" rx="10" width="48" x="289" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="287" y="33"></rect>
<text class="terminal" x="297" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="357" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="355" y="33"></rect>
<text class="terminal" x="365" y="53">EXISTS</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="467" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="465" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="477" y="21">name</text></a><rect height="32" rx="10" width="40" x="543" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="541" y="1"></rect>
<text class="terminal" x="551" y="21">ON</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="603" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="601" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="613" y="21">table_name</text></a><a xlink:href="#opt_policy_type" xlink:title="opt_policy_type">
<rect height="32" width="120" x="107" y="101"></rect>
<rect class="nonterminal" height="32" width="120" x="105" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="10" class="nonterminal" x="117" y="119">opt_policy_type</text></a><a xlink:href="#opt_policy_command" xlink:title="opt_policy_command">
<rect height="32" width="154" x="247" y="101"></rect>
<rect class="nonterminal" height="32" width="154" x="245" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="257" y="119">opt_policy_command</text></a><a xlink:href="#opt_policy_roles" xlink:title="opt_policy_roles">
<rect height="32" width="124" x="421" y="101"></rect>
<rect class="nonterminal" height="32" width="124" x="419" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="431" y="119">opt_policy_roles</text></a><a xlink:href="#opt_policy_exprs" xlink:title="opt_policy_exprs">
<rect height="32" width="128" x="565" y="101"></rect>
<rect class="nonterminal" height="32" width="128" x="563" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="575" y="119">opt_policy_exprs</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m72 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m56 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m96 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-636 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m120 0 h10 m0 0 h10 m154 0 h10 m0 0 h10 m124 0 h10 m0 0 h10 m128 0 h10 m3 0 h-3"></path>
<polygon points="711 115 719 111 719 119"></polygon>
<polygon points="711 115 703 111 703 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
