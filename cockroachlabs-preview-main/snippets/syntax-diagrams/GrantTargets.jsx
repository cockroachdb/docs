export const GrantTargets = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="477" width="477" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">identifier</text><a xlink:href="#col_name_keyword" xlink:title="col_name_keyword">
<rect height="32" width="142" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="61" y="65">col_name_keyword</text></a><a xlink:href="#unreserved_keyword" xlink:title="unreserved_keyword">
<rect height="32" width="152" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="152" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="11" class="nonterminal" x="61" y="109">unreserved_keyword</text></a><a xlink:href="#complex_table_pattern" xlink:title="complex_table_pattern">
<rect height="32" width="168" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="168" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="61" y="153">complex_table_pattern</text></a><rect height="32" rx="10" width="92" x="71" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="177"></rect>
<text class="terminal" x="79" y="197">SEQUENCE</text><a xlink:href="#table_pattern" xlink:title="table_pattern">
<rect height="32" width="106" x="71" y="223"></rect>
<rect class="nonterminal" height="32" width="106" x="69" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="81" y="241">table_pattern</text></a><rect height="32" rx="10" width="24" x="197" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="195" y="221"></rect>
<text class="terminal" x="205" y="241">,</text>
<rect height="32" rx="10" width="62" x="71" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="265"></rect>
<text class="terminal" x="79" y="285">TABLE</text><a xlink:href="#table_pattern_list" xlink:title="table_pattern_list">
<rect height="32" width="134" x="261" y="179"></rect>
<rect class="nonterminal" height="32" width="134" x="259" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="10" class="nonterminal" x="271" y="197">table_pattern_list</text></a><rect height="32" rx="10" width="92" x="71" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="309"></rect>
<text class="terminal" x="79" y="329">DATABASE</text>
<rect height="32" rx="10" width="90" x="71" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="69" y="353"></rect>
<text class="terminal" x="79" y="373">EXTERNAL</text>
<rect height="32" rx="10" width="112" x="181" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="179" y="353"></rect>
<text class="terminal" x="189" y="373">CONNECTION</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="333" y="311"></rect>
<rect class="nonterminal" height="32" width="82" x="331" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="343" y="329">name_list</text></a><rect height="32" rx="10" width="92" x="71" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="397"></rect>
<text class="terminal" x="79" y="417">FUNCTION</text>
<rect height="32" rx="10" width="104" x="71" y="443"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="69" y="441"></rect>
<text class="terminal" x="79" y="461">PROCEDURE</text><a xlink:href="#function_with_paramtypes_list" xlink:title="function_with_paramtypes_list">
<rect height="32" width="214" x="215" y="399"></rect>
<rect class="nonterminal" height="32" width="214" x="213" y="397"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="225" y="417">function_with_paramtypes_list</text></a><path class="line" d="m17 17 h2 m20 0 h10 m82 0 h10 m0 0 h296 m-418 0 h20 m398 0 h20 m-438 0 q10 0 10 10 m418 0 q0 -10 10 -10 m-428 10 v24 m418 0 v-24 m-418 24 q0 10 10 10 m398 0 q10 0 10 -10 m-408 10 h10 m142 0 h10 m0 0 h236 m-408 -10 v20 m418 0 v-20 m-418 20 v24 m418 0 v-24 m-418 24 q0 10 10 10 m398 0 q10 0 10 -10 m-408 10 h10 m152 0 h10 m0 0 h226 m-408 -10 v20 m418 0 v-20 m-418 20 v24 m418 0 v-24 m-418 24 q0 10 10 10 m398 0 q10 0 10 -10 m-408 10 h10 m168 0 h10 m0 0 h210 m-408 -10 v20 m418 0 v-20 m-418 20 v24 m418 0 v-24 m-418 24 q0 10 10 10 m398 0 q10 0 10 -10 m-388 10 h10 m92 0 h10 m0 0 h58 m-190 0 h20 m170 0 h20 m-210 0 q10 0 10 10 m190 0 q0 -10 10 -10 m-200 10 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m106 0 h10 m0 0 h10 m24 0 h10 m-180 -10 v20 m190 0 v-20 m-190 20 v24 m190 0 v-24 m-190 24 q0 10 10 10 m170 0 q10 0 10 -10 m-180 10 h10 m62 0 h10 m0 0 h88 m20 -88 h10 m134 0 h10 m0 0 h34 m-408 -10 v20 m418 0 v-20 m-418 20 v112 m418 0 v-112 m-418 112 q0 10 10 10 m398 0 q10 0 10 -10 m-388 10 h10 m92 0 h10 m0 0 h130 m-262 0 h20 m242 0 h20 m-282 0 q10 0 10 10 m262 0 q0 -10 10 -10 m-272 10 v24 m262 0 v-24 m-262 24 q0 10 10 10 m242 0 q10 0 10 -10 m-252 10 h10 m90 0 h10 m0 0 h10 m112 0 h10 m20 -44 h10 m82 0 h10 m0 0 h14 m-408 -10 v20 m418 0 v-20 m-418 20 v68 m418 0 v-68 m-418 68 q0 10 10 10 m398 0 q10 0 10 -10 m-388 10 h10 m92 0 h10 m0 0 h12 m-144 0 h20 m124 0 h20 m-164 0 q10 0 10 10 m144 0 q0 -10 10 -10 m-154 10 v24 m144 0 v-24 m-144 24 q0 10 10 10 m124 0 q10 0 10 -10 m-134 10 h10 m104 0 h10 m20 -44 h10 m214 0 h10 m23 -396 h-3"></path>
<polygon points="467 17 475 13 475 21"></polygon>
<polygon points="467 17 459 13 459 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
