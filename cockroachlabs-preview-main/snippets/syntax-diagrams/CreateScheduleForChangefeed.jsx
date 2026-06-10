export const CreateScheduleForChangefeed = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="517" width="1235" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="92" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">SCHEDULE</text>
<rect height="32" rx="10" width="122" x="255" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="122" x="253" y="33"></rect>
<text class="terminal" x="263" y="53">IF NOT EXISTS</text>
<rect height="32" width="114" x="417" y="3"></rect>
<rect class="nonterminal" height="32" width="114" x="415" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="427" y="21">schedule_label</text><rect height="32" rx="10" width="48" x="551" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="549" y="1"></rect>
<text class="terminal" x="559" y="21">FOR</text>
<rect height="32" rx="10" width="110" x="619" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="617" y="1"></rect>
<text class="terminal" x="627" y="21">CHANGEFEED</text><a xlink:href="/docs/stable/sql-grammar#changefeed_table_target" xlink:title="changefeed_table_target">
<rect height="32" width="182" x="65" y="145"></rect>
<rect class="nonterminal" height="32" width="182" x="63" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="11" class="nonterminal" x="75" y="163">changefeed_table_target</text></a><rect height="32" rx="10" width="24" x="65" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="63" y="99"></rect>
<text class="terminal" x="73" y="119">,</text>
<rect height="32" rx="10" width="56" x="287" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="285" y="143"></rect>
<text class="terminal" x="295" y="163">INTO</text>
<rect height="32" width="128" x="363" y="145"></rect>
<rect class="nonterminal" height="32" width="128" x="361" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="11" class="nonterminal" x="373" y="163">changefeed_sink</text><rect height="32" rx="10" width="58" x="531" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="529" y="143"></rect>
<text class="terminal" x="539" y="163">WITH</text>
<rect height="32" width="142" x="629" y="145"></rect>
<rect class="nonterminal" height="32" width="142" x="627" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="639" y="163">changefeed_option</text><rect height="32" rx="10" width="24" x="629" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="627" y="99"></rect>
<text class="terminal" x="637" y="119">,</text>
<rect height="32" rx="10" width="56" x="45" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="43" y="253"></rect>
<text class="terminal" x="53" y="273">INTO</text>
<rect height="32" width="128" x="121" y="255"></rect>
<rect class="nonterminal" height="32" width="128" x="119" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="11" class="nonterminal" x="131" y="273">changefeed_sink</text><rect height="32" rx="10" width="58" x="289" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="287" y="253"></rect>
<text class="terminal" x="297" y="273">WITH</text>
<rect height="32" width="142" x="387" y="255"></rect>
<rect class="nonterminal" height="32" width="142" x="385" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="397" y="273">changefeed_option</text><rect height="32" rx="10" width="24" x="387" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="385" y="209"></rect>
<text class="terminal" x="395" y="229">,</text>
<rect height="32" rx="10" width="38" x="589" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="587" y="253"></rect>
<text class="terminal" x="597" y="273">AS</text>
<rect height="32" rx="10" width="70" x="647" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="645" y="253"></rect>
<text class="terminal" x="655" y="273">SELECT</text><a xlink:href="/docs/stable/sql-grammar#target_list" xlink:title="target_list">
<rect height="32" width="86" x="737" y="255"></rect>
<rect class="nonterminal" height="32" width="86" x="735" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="747" y="273">target_list</text></a><rect height="32" rx="10" width="60" x="843" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="841" y="253"></rect>
<text class="terminal" x="851" y="273">FROM</text><a xlink:href="/docs/stable/sql-grammar#insert_target" xlink:title="insert_target">
<rect height="32" width="104" x="923" y="255"></rect>
<rect class="nonterminal" height="32" width="104" x="921" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="10" class="nonterminal" x="933" y="273">insert_target</text></a><a xlink:href="/docs/stable/sql-grammar#where_clause" xlink:title="where_clause">
<rect height="32" width="106" x="1067" y="287"></rect>
<rect class="nonterminal" height="32" width="106" x="1065" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="11" class="nonterminal" x="1077" y="305">where_clause</text></a><rect height="32" rx="10" width="100" x="525" y="353"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="523" y="351"></rect>
<text class="terminal" x="533" y="371">RECURRING</text>
<rect height="32" width="68" x="645" y="353"></rect>
<rect class="nonterminal" height="32" width="68" x="643" y="351"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="44" font-size="10" class="nonterminal" x="655" y="371">crontab</text><rect height="32" rx="10" width="58" x="637" y="439"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="635" y="437"></rect>
<text class="terminal" x="645" y="457">WITH</text>
<rect height="32" rx="10" width="92" x="715" y="439"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="713" y="437"></rect>
<text class="terminal" x="723" y="457">SCHEDULE</text>
<rect height="32" rx="10" width="84" x="827" y="439"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="825" y="437"></rect>
<text class="terminal" x="835" y="457">OPTIONS</text>
<rect height="32" width="124" x="951" y="439"></rect>
<rect class="nonterminal" height="32" width="124" x="949" y="437"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="961" y="457">schedule_option</text><rect height="32" rx="10" width="26" x="951" y="483"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="949" y="481"></rect>
<text class="terminal" x="959" y="501">(</text>
<rect height="32" width="124" x="997" y="483"></rect>
<rect class="nonterminal" height="32" width="124" x="995" y="481"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="1007" y="501">schedule_option</text><rect height="32" rx="10" width="26" x="1141" y="483"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1139" y="481"></rect>
<text class="terminal" x="1149" y="501">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h132 m-162 0 h20 m142 0 h20 m-182 0 q10 0 10 10 m162 0 q0 -10 10 -10 m-172 10 v12 m162 0 v-12 m-162 12 q0 10 10 10 m142 0 q10 0 10 -10 m-152 10 h10 m122 0 h10 m20 -32 h10 m114 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m110 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-748 142 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m182 0 h10 m-222 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m202 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-202 0 h10 m24 0 h10 m0 0 h158 m20 44 h10 m56 0 h10 m0 0 h10 m128 0 h10 m20 0 h10 m58 0 h10 m20 0 h10 m142 0 h10 m-182 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m162 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-162 0 h10 m24 0 h10 m0 0 h118 m-280 44 h20 m280 0 h20 m-320 0 q10 0 10 10 m300 0 q0 -10 10 -10 m-310 10 v14 m300 0 v-14 m-300 14 q0 10 10 10 m280 0 q10 0 10 -10 m-290 10 h10 m0 0 h270 m20 -34 h382 m-1188 0 h20 m1168 0 h20 m-1208 0 q10 0 10 10 m1188 0 q0 -10 10 -10 m-1198 10 v90 m1188 0 v-90 m-1188 90 q0 10 10 10 m1168 0 q10 0 10 -10 m-1178 10 h10 m56 0 h10 m0 0 h10 m128 0 h10 m20 0 h10 m58 0 h10 m20 0 h10 m142 0 h10 m-182 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m162 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-162 0 h10 m24 0 h10 m0 0 h118 m-280 44 h20 m280 0 h20 m-320 0 q10 0 10 10 m300 0 q0 -10 10 -10 m-310 10 v14 m300 0 v-14 m-300 14 q0 10 10 10 m280 0 q10 0 10 -10 m-290 10 h10 m0 0 h270 m20 -34 h10 m38 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m86 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m104 0 h10 m20 0 h10 m0 0 h116 m-146 0 h20 m126 0 h20 m-166 0 q10 0 10 10 m146 0 q0 -10 10 -10 m-156 10 v12 m146 0 v-12 m-146 12 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m106 0 h10 m42 -142 l2 0 m2 0 l2 0 m2 0 l2 0 m-732 208 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m100 0 h10 m0 0 h10 m68 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-140 54 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h560 m-590 0 h20 m570 0 h20 m-610 0 q10 0 10 10 m590 0 q0 -10 10 -10 m-600 10 v12 m590 0 v-12 m-590 12 q0 10 10 10 m570 0 q10 0 10 -10 m-580 10 h10 m58 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m124 0 h10 m0 0 h92 m-256 0 h20 m236 0 h20 m-276 0 q10 0 10 10 m256 0 q0 -10 10 -10 m-266 10 v24 m256 0 v-24 m-256 24 q0 10 10 10 m236 0 q10 0 10 -10 m-246 10 h10 m26 0 h10 m0 0 h10 m124 0 h10 m0 0 h10 m26 0 h10 m43 -76 h-3"></path>
<polygon points="1225 421 1233 417 1233 425"></polygon>
<polygon points="1225 421 1217 417 1217 425"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
