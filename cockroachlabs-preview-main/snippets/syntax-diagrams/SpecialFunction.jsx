export const SpecialFunction = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="817" width="529" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="128" x="71" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="69" y="1"></rect>
<text class="terminal" x="79" y="21">CURRENT_DATE</text>
<rect height="32" rx="10" width="150" x="71" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="150" x="69" y="45"></rect>
<text class="terminal" x="79" y="65">CURRENT_SCHEMA</text>
<rect height="32" rx="10" width="128" x="71" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="69" y="89"></rect>
<text class="terminal" x="79" y="109">CURRENT_USER</text>
<rect height="32" rx="10" width="128" x="71" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="69" y="133"></rect>
<text class="terminal" x="79" y="153">SESSION_USER</text>
<rect height="32" rx="10" width="26" x="261" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="259" y="1"></rect>
<text class="terminal" x="269" y="21">(</text>
<rect height="32" rx="10" width="80" x="71" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="69" y="177"></rect>
<text class="terminal" x="79" y="197">EXTRACT</text>
<rect height="32" rx="10" width="164" x="71" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="164" x="69" y="221"></rect>
<text class="terminal" x="79" y="241">EXTRACT_DURATION</text>
<rect height="32" rx="10" width="26" x="275" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="273" y="177"></rect>
<text class="terminal" x="283" y="197">(</text><a xlink:href="#extract_list" xlink:title="extract_list">
<rect height="32" width="90" x="321" y="179"></rect>
<rect class="nonterminal" height="32" width="90" x="319" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="331" y="197">extract_list</text></a><rect height="32" rx="10" width="84" x="51" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="49" y="265"></rect>
<text class="terminal" x="59" y="285">OVERLAY</text>
<rect height="32" rx="10" width="26" x="155" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="153" y="265"></rect>
<text class="terminal" x="163" y="285">(</text><a xlink:href="#overlay_list" xlink:title="overlay_list">
<rect height="32" width="92" x="201" y="267"></rect>
<rect class="nonterminal" height="32" width="92" x="199" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="211" y="285">overlay_list</text></a><rect height="32" rx="10" width="90" x="51" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="49" y="309"></rect>
<text class="terminal" x="59" y="329">POSITION</text>
<rect height="32" rx="10" width="26" x="161" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="159" y="309"></rect>
<text class="terminal" x="169" y="329">(</text><a xlink:href="#position_list" xlink:title="position_list">
<rect height="32" width="96" x="207" y="311"></rect>
<rect class="nonterminal" height="32" width="96" x="205" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="217" y="329">position_list</text></a><rect height="32" rx="10" width="100" x="51" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="49" y="353"></rect>
<text class="terminal" x="59" y="373">SUBSTRING</text>
<rect height="32" rx="10" width="26" x="171" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="169" y="353"></rect>
<text class="terminal" x="179" y="373">(</text><a xlink:href="#substr_list" xlink:title="substr_list">
<rect height="32" width="86" x="217" y="355"></rect>
<rect class="nonterminal" height="32" width="86" x="215" y="353"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="227" y="373">substr_list</text></a><rect height="32" rx="10" width="90" x="71" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="69" y="397"></rect>
<text class="terminal" x="79" y="417">GREATEST</text>
<rect height="32" rx="10" width="62" x="71" y="443"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="441"></rect>
<text class="terminal" x="79" y="461">LEAST</text>
<rect height="32" rx="10" width="26" x="201" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="199" y="397"></rect>
<text class="terminal" x="209" y="417">(</text><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="247" y="399"></rect>
<rect class="nonterminal" height="32" width="74" x="245" y="397"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="257" y="417">expr_list</text></a><rect height="32" rx="10" width="174" x="71" y="487"></rect>
<rect class="terminal" height="32" rx="10" width="174" x="69" y="485"></rect>
<text class="terminal" x="79" y="505">CURRENT_TIMESTAMP</text>
<rect height="32" rx="10" width="126" x="71" y="531"></rect>
<rect class="terminal" height="32" rx="10" width="126" x="69" y="529"></rect>
<text class="terminal" x="79" y="549">CURRENT_TIME</text>
<rect height="32" rx="10" width="146" x="71" y="575"></rect>
<rect class="terminal" height="32" rx="10" width="146" x="69" y="573"></rect>
<text class="terminal" x="79" y="593">LOCALTIMESTAMP</text>
<rect height="32" rx="10" width="100" x="71" y="619"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="69" y="617"></rect>
<text class="terminal" x="79" y="637">LOCALTIME</text>
<rect height="32" rx="10" width="26" x="285" y="487"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="283" y="485"></rect>
<text class="terminal" x="293" y="505">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="351" y="519"></rect>
<rect class="nonterminal" height="32" width="64" x="349" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="361" y="537">a_expr</text></a><rect height="32" rx="10" width="56" x="51" y="663"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="49" y="661"></rect>
<text class="terminal" x="59" y="681">TRIM</text>
<rect height="32" rx="10" width="26" x="127" y="663"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="125" y="661"></rect>
<text class="terminal" x="135" y="681">(</text>
<rect height="32" rx="10" width="58" x="193" y="695"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="191" y="693"></rect>
<text class="terminal" x="201" y="713">BOTH</text>
<rect height="32" rx="10" width="82" x="193" y="739"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="191" y="737"></rect>
<text class="terminal" x="201" y="757">LEADING</text>
<rect height="32" rx="10" width="88" x="193" y="783"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="191" y="781"></rect>
<text class="terminal" x="201" y="801">TRAILING</text><a xlink:href="#trim_list" xlink:title="trim_list">
<rect height="32" width="72" x="321" y="663"></rect>
<rect class="nonterminal" height="32" width="72" x="319" y="661"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="48" font-size="10" class="nonterminal" x="331" y="681">trim_list</text></a><rect height="32" rx="10" width="26" x="475" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="473" y="1"></rect>
<text class="terminal" x="483" y="21">)</text>
<path class="line" d="m17 17 h2 m40 0 h10 m128 0 h10 m0 0 h22 m-190 0 h20 m170 0 h20 m-210 0 q10 0 10 10 m190 0 q0 -10 10 -10 m-200 10 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m150 0 h10 m-180 -10 v20 m190 0 v-20 m-190 20 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m128 0 h10 m0 0 h22 m-180 -10 v20 m190 0 v-20 m-190 20 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m128 0 h10 m0 0 h22 m20 -132 h10 m26 0 h10 m0 0 h148 m-424 0 h20 m404 0 h20 m-444 0 q10 0 10 10 m424 0 q0 -10 10 -10 m-434 10 v156 m424 0 v-156 m-424 156 q0 10 10 10 m404 0 q10 0 10 -10 m-394 10 h10 m80 0 h10 m0 0 h84 m-204 0 h20 m184 0 h20 m-224 0 q10 0 10 10 m204 0 q0 -10 10 -10 m-214 10 v24 m204 0 v-24 m-204 24 q0 10 10 10 m184 0 q10 0 10 -10 m-194 10 h10 m164 0 h10 m20 -44 h10 m26 0 h10 m0 0 h10 m90 0 h10 m0 0 h24 m-414 -10 v20 m424 0 v-20 m-424 20 v68 m424 0 v-68 m-424 68 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m84 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m92 0 h10 m0 0 h142 m-414 -10 v20 m424 0 v-20 m-424 20 v24 m424 0 v-24 m-424 24 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m90 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m96 0 h10 m0 0 h132 m-414 -10 v20 m424 0 v-20 m-424 20 v24 m424 0 v-24 m-424 24 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m100 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m86 0 h10 m0 0 h132 m-414 -10 v20 m424 0 v-20 m-424 20 v24 m424 0 v-24 m-424 24 q0 10 10 10 m404 0 q10 0 10 -10 m-394 10 h10 m90 0 h10 m-130 0 h20 m110 0 h20 m-150 0 q10 0 10 10 m130 0 q0 -10 10 -10 m-140 10 v24 m130 0 v-24 m-130 24 q0 10 10 10 m110 0 q10 0 10 -10 m-120 10 h10 m62 0 h10 m0 0 h28 m20 -44 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h114 m-414 -10 v20 m424 0 v-20 m-424 20 v68 m424 0 v-68 m-424 68 q0 10 10 10 m404 0 q10 0 10 -10 m-394 10 h10 m174 0 h10 m-214 0 h20 m194 0 h20 m-234 0 q10 0 10 10 m214 0 q0 -10 10 -10 m-224 10 v24 m214 0 v-24 m-214 24 q0 10 10 10 m194 0 q10 0 10 -10 m-204 10 h10 m126 0 h10 m0 0 h48 m-204 -10 v20 m214 0 v-20 m-214 20 v24 m214 0 v-24 m-214 24 q0 10 10 10 m194 0 q10 0 10 -10 m-204 10 h10 m146 0 h10 m0 0 h28 m-204 -10 v20 m214 0 v-20 m-214 20 v24 m214 0 v-24 m-214 24 q0 10 10 10 m194 0 q10 0 10 -10 m-204 10 h10 m100 0 h10 m0 0 h74 m20 -132 h10 m26 0 h10 m20 0 h10 m0 0 h74 m-104 0 h20 m84 0 h20 m-124 0 q10 0 10 10 m104 0 q0 -10 10 -10 m-114 10 v12 m104 0 v-12 m-104 12 q0 10 10 10 m84 0 q10 0 10 -10 m-94 10 h10 m64 0 h10 m-394 -42 v20 m424 0 v-20 m-424 20 v156 m424 0 v-156 m-424 156 q0 10 10 10 m404 0 q10 0 10 -10 m-414 10 h10 m56 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h98 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v12 m128 0 v-12 m-128 12 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m58 0 h10 m0 0 h30 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m82 0 h10 m0 0 h6 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m20 -120 h10 m72 0 h10 m0 0 h42 m20 -660 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="519 17 527 13 527 21"></polygon>
<polygon points="519 17 511 13 511 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
