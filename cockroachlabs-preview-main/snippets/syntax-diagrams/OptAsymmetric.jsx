export const OptAsymmetric = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1323" width="627" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="19 17 11 13 11 21"></polygon><a xlink:href="#c_expr" xlink:title="c_expr">
<rect height="32" width="62" x="53" y="3"></rect>
<rect class="nonterminal" height="32" width="62" x="51" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="38" font-size="10" class="nonterminal" x="63" y="21">c_expr</text></a><rect height="32" rx="10" width="30" x="73" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="71" y="45"></rect>
<text class="terminal" x="81" y="65">+</text>
<rect height="32" rx="10" width="26" x="73" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="71" y="89"></rect>
<text class="terminal" x="81" y="109">-</text>
<rect height="32" rx="10" width="30" x="73" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="71" y="133"></rect>
<text class="terminal" x="81" y="153">~</text><a xlink:href="#qual_op" xlink:title="qual_op">
<rect height="32" width="70" x="73" y="179"></rect>
<rect class="nonterminal" height="32" width="70" x="71" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="83" y="197">qual_op</text></a><a xlink:href="#b_expr" xlink:title="b_expr">
<rect height="32" width="64" x="183" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="181" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="193" y="65">b_expr</text></a><rect height="32" rx="10" width="90" x="85" y="261"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="83" y="259"></rect>
<text class="terminal" x="93" y="279">TYPECAST</text><a xlink:href="#cast_target" xlink:title="cast_target">
<rect height="32" width="92" x="195" y="261"></rect>
<rect class="nonterminal" height="32" width="92" x="193" y="259"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="205" y="279">cast_target</text></a><rect height="32" rx="10" width="128" x="85" y="305"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="83" y="303"></rect>
<text class="terminal" x="93" y="323">TYPEANNOTATE</text><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="233" y="305"></rect>
<rect class="nonterminal" height="32" width="84" x="231" y="303"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="243" y="323">typename</text></a><rect height="32" rx="10" width="30" x="105" y="349"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="347"></rect>
<text class="terminal" x="113" y="367">+</text>
<rect height="32" rx="10" width="26" x="105" y="393"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="103" y="391"></rect>
<text class="terminal" x="113" y="411">-</text>
<rect height="32" rx="10" width="28" x="105" y="437"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="103" y="435"></rect>
<text class="terminal" x="113" y="455">*</text>
<rect height="32" rx="10" width="28" x="105" y="481"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="103" y="479"></rect>
<text class="terminal" x="113" y="499">/</text>
<rect height="32" rx="10" width="92" x="105" y="525"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="103" y="523"></rect>
<text class="terminal" x="113" y="543">FLOORDIV</text>
<rect height="32" rx="10" width="34" x="105" y="569"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="103" y="567"></rect>
<text class="terminal" x="113" y="587">%</text>
<rect height="32" rx="10" width="30" x="105" y="613"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="611"></rect>
<text class="terminal" x="113" y="631">^</text>
<rect height="32" rx="10" width="30" x="105" y="657"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="655"></rect>
<text class="terminal" x="113" y="675">#</text>
<rect height="32" rx="10" width="30" x="105" y="701"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="699"></rect>
<text class="terminal" x="113" y="719">&amp;</text>
<rect height="32" rx="10" width="26" x="105" y="745"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="103" y="743"></rect>
<text class="terminal" x="113" y="763">|</text>
<rect height="32" rx="10" width="30" x="105" y="789"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="787"></rect>
<text class="terminal" x="113" y="807">&lt;</text>
<rect height="32" rx="10" width="30" x="105" y="833"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="831"></rect>
<text class="terminal" x="113" y="851">&gt;</text>
<rect height="32" rx="10" width="30" x="105" y="877"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="103" y="875"></rect>
<text class="terminal" x="113" y="895">=</text>
<rect height="32" rx="10" width="76" x="105" y="921"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="103" y="919"></rect>
<text class="terminal" x="113" y="939">CONCAT</text>
<rect height="32" rx="10" width="70" x="105" y="965"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="103" y="963"></rect>
<text class="terminal" x="113" y="983">LSHIFT</text>
<rect height="32" rx="10" width="70" x="105" y="1009"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="103" y="1007"></rect>
<text class="terminal" x="113" y="1027">RSHIFT</text>
<rect height="32" rx="10" width="118" x="105" y="1053"></rect>
<rect class="terminal" height="32" rx="10" width="118" x="103" y="1051"></rect>
<text class="terminal" x="113" y="1071">LESS_EQUALS</text>
<rect height="32" rx="10" width="146" x="105" y="1097"></rect>
<rect class="terminal" height="32" rx="10" width="146" x="103" y="1095"></rect>
<text class="terminal" x="113" y="1115">GREATER_EQUALS</text>
<rect height="32" rx="10" width="114" x="105" y="1141"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="103" y="1139"></rect>
<text class="terminal" x="113" y="1159">NOT_EQUALS</text><a xlink:href="#qual_op" xlink:title="qual_op">
<rect height="32" width="70" x="105" y="1185"></rect>
<rect class="nonterminal" height="32" width="70" x="103" y="1183"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="115" y="1203">qual_op</text></a><a xlink:href="#b_expr" xlink:title="b_expr">
<rect height="32" width="64" x="291" y="349"></rect>
<rect class="nonterminal" height="32" width="64" x="289" y="347"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="301" y="367">b_expr</text></a><rect height="32" rx="10" width="36" x="85" y="1229"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="83" y="1227"></rect>
<text class="terminal" x="93" y="1247">IS</text>
<rect height="32" rx="10" width="48" x="161" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="159" y="1259"></rect>
<text class="terminal" x="169" y="1279">NOT</text>
<rect height="32" rx="10" width="86" x="269" y="1229"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="267" y="1227"></rect>
<text class="terminal" x="277" y="1247">DISTINCT</text>
<rect height="32" rx="10" width="60" x="375" y="1229"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="373" y="1227"></rect>
<text class="terminal" x="383" y="1247">FROM</text><a xlink:href="#b_expr" xlink:title="b_expr">
<rect height="32" width="64" x="455" y="1229"></rect>
<rect class="nonterminal" height="32" width="64" x="453" y="1227"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="465" y="1247">b_expr</text></a><rect height="32" rx="10" width="38" x="269" y="1273"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="267" y="1271"></rect>
<text class="terminal" x="277" y="1291">OF</text>
<rect height="32" rx="10" width="26" x="327" y="1273"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="325" y="1271"></rect>
<text class="terminal" x="335" y="1291">(</text><a xlink:href="#type_list" xlink:title="type_list">
<rect height="32" width="74" x="373" y="1273"></rect>
<rect class="nonterminal" height="32" width="74" x="371" y="1271"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="383" y="1291">type_list</text></a><rect height="32" rx="10" width="26" x="467" y="1273"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="465" y="1271"></rect>
<text class="terminal" x="475" y="1291">)</text>
<path class="line" d="m19 17 h2 m20 0 h10 m62 0 h10 m0 0 h132 m-234 0 h20 m214 0 h20 m-254 0 q10 0 10 10 m234 0 q0 -10 10 -10 m-244 10 v24 m234 0 v-24 m-234 24 q0 10 10 10 m214 0 q10 0 10 -10 m-204 10 h10 m30 0 h10 m0 0 h40 m-110 0 h20 m90 0 h20 m-130 0 q10 0 10 10 m110 0 q0 -10 10 -10 m-120 10 v24 m110 0 v-24 m-110 24 q0 10 10 10 m90 0 q10 0 10 -10 m-100 10 h10 m26 0 h10 m0 0 h44 m-100 -10 v20 m110 0 v-20 m-110 20 v24 m110 0 v-24 m-110 24 q0 10 10 10 m90 0 q10 0 10 -10 m-100 10 h10 m30 0 h10 m0 0 h40 m-100 -10 v20 m110 0 v-20 m-110 20 v24 m110 0 v-24 m-110 24 q0 10 10 10 m90 0 q10 0 10 -10 m-100 10 h10 m70 0 h10 m20 -132 h10 m64 0 h10 m22 -44 l2 0 m2 0 l2 0 m2 0 l2 0 m-286 258 l2 0 m2 0 l2 0 m2 0 l2 0 m62 0 h10 m90 0 h10 m0 0 h10 m92 0 h10 m0 0 h252 m-494 0 h20 m474 0 h20 m-514 0 q10 0 10 10 m494 0 q0 -10 10 -10 m-504 10 v24 m494 0 v-24 m-494 24 q0 10 10 10 m474 0 q10 0 10 -10 m-484 10 h10 m128 0 h10 m0 0 h10 m84 0 h10 m0 0 h222 m-484 -10 v20 m494 0 v-20 m-494 20 v24 m494 0 v-24 m-494 24 q0 10 10 10 m474 0 q10 0 10 -10 m-464 10 h10 m30 0 h10 m0 0 h116 m-186 0 h20 m166 0 h20 m-206 0 q10 0 10 10 m186 0 q0 -10 10 -10 m-196 10 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m26 0 h10 m0 0 h120 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m28 0 h10 m0 0 h118 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m28 0 h10 m0 0 h118 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m92 0 h10 m0 0 h54 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m34 0 h10 m0 0 h112 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m26 0 h10 m0 0 h120 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m30 0 h10 m0 0 h116 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m76 0 h10 m0 0 h70 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m70 0 h10 m0 0 h76 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m70 0 h10 m0 0 h76 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m118 0 h10 m0 0 h28 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m146 0 h10 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m114 0 h10 m0 0 h32 m-176 -10 v20 m186 0 v-20 m-186 20 v24 m186 0 v-24 m-186 24 q0 10 10 10 m166 0 q10 0 10 -10 m-176 10 h10 m70 0 h10 m0 0 h76 m20 -836 h10 m64 0 h10 m0 0 h184 m-484 -10 v20 m494 0 v-20 m-494 20 v860 m494 0 v-860 m-494 860 q0 10 10 10 m474 0 q10 0 10 -10 m-484 10 h10 m36 0 h10 m20 0 h10 m0 0 h58 m-88 0 h20 m68 0 h20 m-108 0 q10 0 10 10 m88 0 q0 -10 10 -10 m-98 10 v12 m88 0 v-12 m-88 12 q0 10 10 10 m68 0 q10 0 10 -10 m-78 10 h10 m48 0 h10 m40 -32 h10 m86 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m64 0 h10 m-290 0 h20 m270 0 h20 m-310 0 q10 0 10 10 m290 0 q0 -10 10 -10 m-300 10 v24 m290 0 v-24 m-290 24 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m38 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m0 0 h26 m-494 -1012 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m514 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-514 0 h10 m0 0 h504 m-554 32 h20 m554 0 h20 m-594 0 q10 0 10 10 m574 0 q0 -10 10 -10 m-584 10 v1026 m574 0 v-1026 m-574 1026 q0 10 10 10 m554 0 q10 0 10 -10 m-564 10 h10 m0 0 h544 m23 -1046 h-3"></path>
<polygon points="617 275 625 271 625 279"></polygon>
<polygon points="617 275 609 271 609 279"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
