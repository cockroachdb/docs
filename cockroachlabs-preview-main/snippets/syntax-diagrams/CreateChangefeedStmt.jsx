export const CreateChangefeedStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="1489" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">CREATE</text>
<rect height="32" rx="10" width="110" x="143" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="141" y="1"></rect>
<text class="terminal" x="151" y="21">CHANGEFEED</text><a xlink:href="#for_with_lookahead_variants" xlink:title="for_with_lookahead_variants">
<rect height="32" width="204" x="293" y="3"></rect>
<rect class="nonterminal" height="32" width="204" x="291" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="180" font-size="10" class="nonterminal" x="303" y="21">for_with_lookahead_variants</text></a><a xlink:href="#changefeed_table_targets" xlink:title="changefeed_table_targets">
<rect height="32" width="188" x="517" y="3"></rect>
<rect class="nonterminal" height="32" width="188" x="515" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="11" class="nonterminal" x="527" y="21">changefeed_table_targets</text></a><a xlink:href="#opt_changefeed_sink" xlink:title="opt_changefeed_sink">
<rect height="32" width="156" x="725" y="3"></rect>
<rect class="nonterminal" height="32" width="156" x="723" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="735" y="21">opt_changefeed_sink</text></a><a xlink:href="#opt_with_options" xlink:title="opt_with_options">
<rect height="32" width="130" x="901" y="3"></rect>
<rect class="nonterminal" height="32" width="130" x="899" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="911" y="21">opt_with_options</text></a><a xlink:href="#opt_changefeed_sink" xlink:title="opt_changefeed_sink">
<rect height="32" width="156" x="293" y="47"></rect>
<rect class="nonterminal" height="32" width="156" x="291" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="303" y="65">opt_changefeed_sink</text></a><a xlink:href="#opt_with_options" xlink:title="opt_with_options">
<rect height="32" width="130" x="469" y="47"></rect>
<rect class="nonterminal" height="32" width="130" x="467" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="479" y="65">opt_with_options</text></a><rect height="32" rx="10" width="38" x="619" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="617" y="45"></rect>
<text class="terminal" x="627" y="65">AS</text>
<rect height="32" rx="10" width="70" x="677" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="675" y="45"></rect>
<text class="terminal" x="685" y="65">SELECT</text><a xlink:href="#target_list" xlink:title="target_list">
<rect height="32" width="86" x="767" y="47"></rect>
<rect class="nonterminal" height="32" width="86" x="765" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="777" y="65">target_list</text></a><rect height="32" rx="10" width="60" x="873" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="871" y="45"></rect>
<text class="terminal" x="881" y="65">FROM</text><a xlink:href="#changefeed_target_expr" xlink:title="changefeed_target_expr">
<rect height="32" width="178" x="953" y="47"></rect>
<rect class="nonterminal" height="32" width="178" x="951" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="154" font-size="11" class="nonterminal" x="963" y="65">changefeed_target_expr</text></a><a xlink:href="#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="1151" y="47"></rect>
<rect class="nonterminal" height="32" width="136" x="1149" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="1161" y="65">opt_where_clause</text></a><rect height="32" rx="10" width="290" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="290" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">CREATE_CHANGEFEED_FOR_DATABASE</text>
<rect height="32" rx="10" width="110" x="361" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="359" y="89"></rect>
<text class="terminal" x="369" y="109">CHANGEFEED</text>
<rect height="32" rx="10" width="48" x="491" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="489" y="89"></rect>
<text class="terminal" x="499" y="109">FOR</text>
<rect height="32" rx="10" width="92" x="559" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="557" y="89"></rect>
<text class="terminal" x="567" y="109">DATABASE</text><a xlink:href="#database_name" xlink:title="database_name">
<rect height="32" width="124" x="671" y="91"></rect>
<rect class="nonterminal" height="32" width="124" x="669" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="681" y="109">database_name</text></a><a xlink:href="#optional_db_level_changefeed_filter_option" xlink:title="optional_db_level_changefeed_filter_option">
<rect height="32" width="300" x="815" y="91"></rect>
<rect class="nonterminal" height="32" width="300" x="813" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="276" font-size="10" class="nonterminal" x="825" y="109">optional_db_level_changefeed_filter_option</text></a><a xlink:href="#opt_changefeed_sink" xlink:title="opt_changefeed_sink">
<rect height="32" width="156" x="1135" y="91"></rect>
<rect class="nonterminal" height="32" width="156" x="1133" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="1145" y="109">opt_changefeed_sink</text></a><a xlink:href="#opt_with_options" xlink:title="opt_with_options">
<rect height="32" width="130" x="1311" y="91"></rect>
<rect class="nonterminal" height="32" width="130" x="1309" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="1321" y="109">opt_with_options</text></a><path class="line" d="m17 17 h2 m20 0 h10 m72 0 h10 m0 0 h10 m110 0 h10 m20 0 h10 m204 0 h10 m0 0 h10 m188 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m130 0 h10 m0 0 h256 m-1034 0 h20 m1014 0 h20 m-1054 0 q10 0 10 10 m1034 0 q0 -10 10 -10 m-1044 10 v24 m1034 0 v-24 m-1034 24 q0 10 10 10 m1014 0 q10 0 10 -10 m-1024 10 h10 m156 0 h10 m0 0 h10 m130 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m86 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m178 0 h10 m0 0 h10 m136 0 h10 m20 -44 h134 m-1430 0 h20 m1410 0 h20 m-1450 0 q10 0 10 10 m1430 0 q0 -10 10 -10 m-1440 10 v68 m1430 0 v-68 m-1430 68 q0 10 10 10 m1410 0 q10 0 10 -10 m-1420 10 h10 m290 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m0 0 h10 m300 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m130 0 h10 m23 -88 h-3"></path>
<polygon points="1479 17 1487 13 1487 21"></polygon>
<polygon points="1479 17 1471 13 1471 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
