export const FuncExprCommonSubexpr = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="981" width="773" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="100" x="91" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="89" y="1"></rect>
<text class="terminal" x="99" y="21">COLLATION</text>
<rect height="32" rx="10" width="48" x="211" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="209" y="1"></rect>
<text class="terminal" x="219" y="21">FOR</text>
<rect height="32" rx="10" width="26" x="279" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="277" y="1"></rect>
<text class="terminal" x="287" y="21">(</text>
<rect height="32" rx="10" width="34" x="111" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="109" y="45"></rect>
<text class="terminal" x="119" y="65">IF</text>
<rect height="32" rx="10" width="26" x="165" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="163" y="45"></rect>
<text class="terminal" x="173" y="65">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="211" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="209" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="221" y="65">a_expr</text></a><rect height="32" rx="10" width="24" x="295" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="293" y="45"></rect>
<text class="terminal" x="303" y="65">,</text>
<rect height="32" rx="10" width="70" x="131" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="129" y="89"></rect>
<text class="terminal" x="139" y="109">NULLIF</text>
<rect height="32" rx="10" width="70" x="131" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="129" y="133"></rect>
<text class="terminal" x="139" y="153">IFNULL</text>
<rect height="32" rx="10" width="26" x="241" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="239" y="89"></rect>
<text class="terminal" x="249" y="109">(</text>
<rect height="32" rx="10" width="82" x="111" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="109" y="177"></rect>
<text class="terminal" x="119" y="197">IFERROR</text>
<rect height="32" rx="10" width="26" x="213" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="211" y="177"></rect>
<text class="terminal" x="221" y="197">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="279" y="211"></rect>
<rect class="nonterminal" height="32" width="64" x="277" y="209"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="289" y="229">a_expr</text></a><rect height="32" rx="10" width="24" x="363" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="361" y="209"></rect>
<text class="terminal" x="371" y="229">,</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="447" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="445" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="457" y="65">a_expr</text></a><rect height="32" rx="10" width="24" x="531" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="529" y="45"></rect>
<text class="terminal" x="539" y="65">,</text>
<rect height="32" rx="10" width="82" x="91" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="89" y="253"></rect>
<text class="terminal" x="99" y="273">ISERROR</text>
<rect height="32" rx="10" width="26" x="193" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="191" y="253"></rect>
<text class="terminal" x="201" y="273">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="259" y="287"></rect>
<rect class="nonterminal" height="32" width="64" x="257" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="269" y="305">a_expr</text></a><rect height="32" rx="10" width="24" x="343" y="287"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="341" y="285"></rect>
<text class="terminal" x="351" y="305">,</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="595" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="593" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="605" y="21">a_expr</text></a><rect height="32" rx="10" width="56" x="71" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="69" y="329"></rect>
<text class="terminal" x="79" y="349">CAST</text>
<rect height="32" rx="10" width="26" x="147" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="145" y="329"></rect>
<text class="terminal" x="155" y="349">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="193" y="331"></rect>
<rect class="nonterminal" height="32" width="64" x="191" y="329"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="203" y="349">a_expr</text></a><rect height="32" rx="10" width="38" x="277" y="331"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="275" y="329"></rect>
<text class="terminal" x="285" y="349">AS</text><a xlink:href="#cast_target" xlink:title="cast_target">
<rect height="32" width="92" x="335" y="331"></rect>
<rect class="nonterminal" height="32" width="92" x="333" y="329"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="345" y="349">cast_target</text></a><rect height="32" rx="10" width="138" x="71" y="375"></rect>
<rect class="terminal" height="32" rx="10" width="138" x="69" y="373"></rect>
<text class="terminal" x="79" y="393">ANNOTATE_TYPE</text>
<rect height="32" rx="10" width="26" x="229" y="375"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="227" y="373"></rect>
<text class="terminal" x="237" y="393">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="275" y="375"></rect>
<rect class="nonterminal" height="32" width="64" x="273" y="373"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="285" y="393">a_expr</text></a><rect height="32" rx="10" width="24" x="359" y="375"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="357" y="373"></rect>
<text class="terminal" x="367" y="393">,</text><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="403" y="375"></rect>
<rect class="nonterminal" height="32" width="84" x="401" y="373"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="413" y="393">typename</text></a><rect height="32" rx="10" width="92" x="71" y="419"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="69" y="417"></rect>
<text class="terminal" x="79" y="437">COALESCE</text>
<rect height="32" rx="10" width="26" x="183" y="419"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="181" y="417"></rect>
<text class="terminal" x="191" y="437">(</text><a xlink:href="#expr_list" xlink:title="expr_list">
<rect height="32" width="74" x="229" y="419"></rect>
<rect class="nonterminal" height="32" width="74" x="227" y="417"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="239" y="437">expr_list</text></a><rect height="32" rx="10" width="26" x="699" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="697" y="1"></rect>
<text class="terminal" x="707" y="21">)</text>
<rect height="32" rx="10" width="128" x="51" y="463"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="49" y="461"></rect>
<text class="terminal" x="59" y="481">CURRENT_DATE</text>
<rect height="32" rx="10" width="150" x="51" y="507"></rect>
<rect class="terminal" height="32" rx="10" width="150" x="49" y="505"></rect>
<text class="terminal" x="59" y="525">CURRENT_SCHEMA</text>
<rect height="32" rx="10" width="158" x="51" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="158" x="49" y="549"></rect>
<text class="terminal" x="59" y="569">CURRENT_CATALOG</text>
<rect height="32" rx="10" width="174" x="51" y="595"></rect>
<rect class="terminal" height="32" rx="10" width="174" x="49" y="593"></rect>
<text class="terminal" x="59" y="613">CURRENT_TIMESTAMP</text>
<rect height="32" rx="10" width="126" x="51" y="639"></rect>
<rect class="terminal" height="32" rx="10" width="126" x="49" y="637"></rect>
<text class="terminal" x="59" y="657">CURRENT_TIME</text>
<rect height="32" rx="10" width="146" x="51" y="683"></rect>
<rect class="terminal" height="32" rx="10" width="146" x="49" y="681"></rect>
<text class="terminal" x="59" y="701">LOCALTIMESTAMP</text>
<rect height="32" rx="10" width="100" x="51" y="727"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="49" y="725"></rect>
<text class="terminal" x="59" y="745">LOCALTIME</text>
<rect height="32" rx="10" width="128" x="51" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="49" y="769"></rect>
<text class="terminal" x="59" y="789">CURRENT_USER</text>
<rect height="32" rx="10" width="130" x="51" y="815"></rect>
<rect class="terminal" height="32" rx="10" width="130" x="49" y="813"></rect>
<text class="terminal" x="59" y="833">CURRENT_ROLE</text>
<rect height="32" rx="10" width="128" x="51" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="49" y="857"></rect>
<text class="terminal" x="59" y="877">SESSION_USER</text>
<rect height="32" rx="10" width="56" x="51" y="903"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="49" y="901"></rect>
<text class="terminal" x="59" y="921">USER</text><a xlink:href="#special_function" xlink:title="special_function">
<rect height="32" width="122" x="51" y="947"></rect>
<rect class="nonterminal" height="32" width="122" x="49" y="945"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="61" y="965">special_function</text></a><path class="line" d="m17 17 h2 m60 0 h10 m100 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m26 0 h10 m0 0 h250 m-504 0 h20 m484 0 h20 m-524 0 q10 0 10 10 m504 0 q0 -10 10 -10 m-514 10 v24 m504 0 v-24 m-504 24 q0 10 10 10 m484 0 q10 0 10 -10 m-474 10 h10 m34 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m24 0 h10 m0 0 h88 m-336 0 h20 m316 0 h20 m-356 0 q10 0 10 10 m336 0 q0 -10 10 -10 m-346 10 v24 m336 0 v-24 m-336 24 q0 10 10 10 m316 0 q10 0 10 -10 m-306 10 h10 m70 0 h10 m-110 0 h20 m90 0 h20 m-130 0 q10 0 10 10 m110 0 q0 -10 10 -10 m-120 10 v24 m110 0 v-24 m-110 24 q0 10 10 10 m90 0 q10 0 10 -10 m-100 10 h10 m70 0 h10 m20 -44 h10 m26 0 h10 m0 0 h140 m-326 -10 v20 m336 0 v-20 m-336 20 v68 m336 0 v-68 m-336 68 q0 10 10 10 m316 0 q10 0 10 -10 m-326 10 h10 m82 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h118 m-148 0 h20 m128 0 h20 m-168 0 q10 0 10 10 m148 0 q0 -10 10 -10 m-158 10 v12 m148 0 v-12 m-148 12 q0 10 10 10 m128 0 q10 0 10 -10 m-138 10 h10 m64 0 h10 m0 0 h10 m24 0 h10 m40 -164 h10 m64 0 h10 m0 0 h10 m24 0 h10 m-494 -10 v20 m504 0 v-20 m-504 20 v188 m504 0 v-188 m-504 188 q0 10 10 10 m484 0 q10 0 10 -10 m-494 10 h10 m82 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h118 m-148 0 h20 m128 0 h20 m-168 0 q10 0 10 10 m148 0 q0 -10 10 -10 m-158 10 v12 m148 0 v-12 m-148 12 q0 10 10 10 m128 0 q10 0 10 -10 m-138 10 h10 m64 0 h10 m0 0 h10 m24 0 h10 m20 -32 h168 m20 -252 h10 m64 0 h10 m-628 0 h20 m608 0 h20 m-648 0 q10 0 10 10 m628 0 q0 -10 10 -10 m-638 10 v308 m628 0 v-308 m-628 308 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m56 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m92 0 h10 m0 0 h232 m-618 -10 v20 m628 0 v-20 m-628 20 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m138 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m24 0 h10 m0 0 h10 m84 0 h10 m0 0 h172 m-618 -10 v20 m628 0 v-20 m-628 20 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m92 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h356 m20 -416 h10 m26 0 h10 m-714 0 h20 m694 0 h20 m-734 0 q10 0 10 10 m714 0 q0 -10 10 -10 m-724 10 v440 m714 0 v-440 m-714 440 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m128 0 h10 m0 0 h546 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m150 0 h10 m0 0 h524 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m158 0 h10 m0 0 h516 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m174 0 h10 m0 0 h500 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m126 0 h10 m0 0 h548 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m146 0 h10 m0 0 h528 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m100 0 h10 m0 0 h574 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m128 0 h10 m0 0 h546 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m130 0 h10 m0 0 h544 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m128 0 h10 m0 0 h546 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m56 0 h10 m0 0 h618 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m122 0 h10 m0 0 h552 m23 -944 h-3"></path>
<polygon points="763 17 771 13 771 21"></polygon>
<polygon points="763 17 755 13 755 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
