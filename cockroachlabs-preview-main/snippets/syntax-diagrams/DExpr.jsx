export const DExpr = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="981" width="539" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="32" x="71" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="69" y="33"></rect>
<text class="terminal" x="79" y="53">@</text>
<rect height="32" rx="10" width="74" x="143" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="141" y="1"></rect>
<text class="terminal" x="151" y="21">ICONST</text>
<rect height="32" rx="10" width="74" x="51" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="49" y="77"></rect>
<text class="terminal" x="59" y="97">FCONST</text>
<rect height="32" rx="10" width="76" x="51" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="121"></rect>
<text class="terminal" x="59" y="141">SCONST</text>
<rect height="32" rx="10" width="76" x="51" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="165"></rect>
<text class="terminal" x="59" y="185">BCONST</text>
<rect height="32" rx="10" width="90" x="51" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="49" y="209"></rect>
<text class="terminal" x="59" y="229">BITCONST</text><a xlink:href="#typed_literal" xlink:title="typed_literal">
<rect height="32" width="100" x="51" y="255"></rect>
<rect class="nonterminal" height="32" width="100" x="49" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="61" y="273">typed_literal</text></a><a xlink:href="#interval_value" xlink:title="interval_value">
<rect height="32" width="110" x="51" y="299"></rect>
<rect class="nonterminal" height="32" width="110" x="49" y="297"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="61" y="317">interval_value</text></a><rect height="32" rx="10" width="56" x="51" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="49" y="341"></rect>
<text class="terminal" x="59" y="361">TRUE</text>
<rect height="32" rx="10" width="62" x="51" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="385"></rect>
<text class="terminal" x="59" y="405">FALSE</text>
<rect height="32" rx="10" width="56" x="51" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="49" y="429"></rect>
<text class="terminal" x="59" y="449">NULL</text><a xlink:href="#column_path_with_star" xlink:title="column_path_with_star">
<rect height="32" width="168" x="51" y="475"></rect>
<rect class="nonterminal" height="32" width="168" x="49" y="473"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="61" y="493">column_path_with_star</text></a><rect height="32" rx="10" width="120" x="51" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="120" x="49" y="517"></rect>
<text class="terminal" x="59" y="537">PLACEHOLDER</text>
<rect height="32" rx="10" width="26" x="51" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="49" y="561"></rect>
<text class="terminal" x="59" y="581">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="97" y="563"></rect>
<rect class="nonterminal" height="32" width="64" x="95" y="561"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="107" y="581">a_expr</text></a><rect height="32" rx="10" width="26" x="181" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="179" y="561"></rect>
<text class="terminal" x="189" y="581">)</text>
<rect height="32" rx="10" width="24" x="247" y="595"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="245" y="593"></rect>
<text class="terminal" x="255" y="613">.</text>
<rect height="32" rx="10" width="28" x="311" y="595"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="309" y="593"></rect>
<text class="terminal" x="319" y="613">*</text><a xlink:href="#unrestricted_name" xlink:title="unrestricted_name">
<rect height="32" width="140" x="311" y="639"></rect>
<rect class="nonterminal" height="32" width="140" x="309" y="637"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="321" y="657">unrestricted_name</text></a><rect height="32" rx="10" width="32" x="311" y="683"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="309" y="681"></rect>
<text class="terminal" x="319" y="701">@</text>
<rect height="32" rx="10" width="74" x="363" y="683"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="361" y="681"></rect>
<text class="terminal" x="371" y="701">ICONST</text><a xlink:href="#func_expr" xlink:title="func_expr">
<rect height="32" width="82" x="51" y="727"></rect>
<rect class="nonterminal" height="32" width="82" x="49" y="725"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="61" y="745">func_expr</text></a><a xlink:href="#select_with_parens" xlink:title="select_with_parens">
<rect height="32" width="144" x="51" y="771"></rect>
<rect class="nonterminal" height="32" width="144" x="49" y="769"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="10" class="nonterminal" x="61" y="789">select_with_parens</text></a><a xlink:href="#labeled_row" xlink:title="labeled_row">
<rect height="32" width="98" x="51" y="815"></rect>
<rect class="nonterminal" height="32" width="98" x="49" y="813"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="61" y="833">labeled_row</text></a><rect height="32" rx="10" width="66" x="51" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="49" y="857"></rect>
<text class="terminal" x="59" y="877">ARRAY</text><a xlink:href="#select_with_parens" xlink:title="select_with_parens">
<rect height="32" width="144" x="157" y="859"></rect>
<rect class="nonterminal" height="32" width="144" x="155" y="857"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="10" class="nonterminal" x="167" y="877">select_with_parens</text></a><a xlink:href="#row" xlink:title="row">
<rect height="32" width="42" x="157" y="903"></rect>
<rect class="nonterminal" height="32" width="42" x="155" y="901"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="18" font-size="10" class="nonterminal" x="167" y="921">row</text></a><a xlink:href="#array_expr" xlink:title="array_expr">
<rect height="32" width="90" x="157" y="947"></rect>
<rect class="nonterminal" height="32" width="90" x="155" y="945"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="167" y="965">array_expr</text></a><path class="line" d="m17 17 h2 m40 0 h10 m0 0 h42 m-72 0 h20 m52 0 h20 m-92 0 q10 0 10 10 m72 0 q0 -10 10 -10 m-82 10 v12 m72 0 v-12 m-72 12 q0 10 10 10 m52 0 q10 0 10 -10 m-62 10 h10 m32 0 h10 m20 -32 h10 m74 0 h10 m0 0 h274 m-480 0 h20 m460 0 h20 m-500 0 q10 0 10 10 m480 0 q0 -10 10 -10 m-490 10 v56 m480 0 v-56 m-480 56 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m74 0 h10 m0 0 h366 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m76 0 h10 m0 0 h364 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m76 0 h10 m0 0 h364 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m90 0 h10 m0 0 h350 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m100 0 h10 m0 0 h340 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m110 0 h10 m0 0 h330 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m56 0 h10 m0 0 h384 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m62 0 h10 m0 0 h378 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m56 0 h10 m0 0 h384 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m168 0 h10 m0 0 h272 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m120 0 h10 m0 0 h320 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h234 m-264 0 h20 m244 0 h20 m-284 0 q10 0 10 10 m264 0 q0 -10 10 -10 m-274 10 v12 m264 0 v-12 m-264 12 q0 10 10 10 m244 0 q10 0 10 -10 m-254 10 h10 m24 0 h10 m20 0 h10 m28 0 h10 m0 0 h112 m-180 0 h20 m160 0 h20 m-200 0 q10 0 10 10 m180 0 q0 -10 10 -10 m-190 10 v24 m180 0 v-24 m-180 24 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m140 0 h10 m-170 -10 v20 m180 0 v-20 m-180 20 v24 m180 0 v-24 m-180 24 q0 10 10 10 m160 0 q10 0 10 -10 m-170 10 h10 m32 0 h10 m0 0 h10 m74 0 h10 m0 0 h14 m-430 -130 v20 m480 0 v-20 m-480 20 v144 m480 0 v-144 m-480 144 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m82 0 h10 m0 0 h358 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m144 0 h10 m0 0 h296 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m98 0 h10 m0 0 h342 m-470 -10 v20 m480 0 v-20 m-480 20 v24 m480 0 v-24 m-480 24 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m66 0 h10 m20 0 h10 m144 0 h10 m-184 0 h20 m164 0 h20 m-204 0 q10 0 10 10 m184 0 q0 -10 10 -10 m-194 10 v24 m184 0 v-24 m-184 24 q0 10 10 10 m164 0 q10 0 10 -10 m-174 10 h10 m42 0 h10 m0 0 h102 m-174 -10 v20 m184 0 v-20 m-184 20 v24 m184 0 v-24 m-184 24 q0 10 10 10 m164 0 q10 0 10 -10 m-174 10 h10 m90 0 h10 m0 0 h54 m20 -88 h170 m23 -856 h-3"></path>
<polygon points="529 17 537 13 537 21"></polygon>
<polygon points="529 17 521 13 521 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
