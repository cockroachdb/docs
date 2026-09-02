export const RelocateKw = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="257" width="505" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="48" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">ADD</text><a xlink:href="#changefeed_table_targets" xlink:title="changefeed_table_targets">
<rect height="32" width="188" x="119" y="3"></rect>
<rect class="nonterminal" height="32" width="188" x="117" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="11" class="nonterminal" x="129" y="21">changefeed_table_targets</text></a><a xlink:href="#opt_with_options" xlink:title="opt_with_options">
<rect height="32" width="130" x="327" y="3"></rect>
<rect class="nonterminal" height="32" width="130" x="325" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="337" y="21">opt_with_options</text></a><rect height="32" rx="10" width="58" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">DROP</text><a xlink:href="#changefeed_table_targets" xlink:title="changefeed_table_targets">
<rect height="32" width="188" x="129" y="47"></rect>
<rect class="nonterminal" height="32" width="188" x="127" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="11" class="nonterminal" x="139" y="65">changefeed_table_targets</text></a><rect height="32" rx="10" width="44" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">SET</text><a xlink:href="#kv_option_list" xlink:title="kv_option_list">
<rect height="32" width="108" x="135" y="91"></rect>
<rect class="nonterminal" height="32" width="108" x="133" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="145" y="109">kv_option_list</text></a><a xlink:href="#db_level_changefeed_filter_option" xlink:title="db_level_changefeed_filter_option">
<rect height="32" width="240" x="135" y="135"></rect>
<rect class="nonterminal" height="32" width="240" x="133" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="216" font-size="10" class="nonterminal" x="145" y="153">db_level_changefeed_filter_option</text></a><rect height="32" rx="10" width="64" x="51" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="177"></rect>
<text class="terminal" x="59" y="197">UNSET</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="155" y="179"></rect>
<rect class="nonterminal" height="32" width="82" x="153" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="165" y="197">name_list</text></a><a xlink:href="#include_or_exclude" xlink:title="include_or_exclude">
<rect height="32" width="142" x="155" y="223"></rect>
<rect class="nonterminal" height="32" width="142" x="153" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="165" y="241">include_or_exclude</text></a><rect height="32" rx="10" width="72" x="317" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="315" y="221"></rect>
<text class="terminal" x="325" y="241">TABLES</text>
<path class="line" d="m17 17 h2 m20 0 h10 m48 0 h10 m0 0 h10 m188 0 h10 m0 0 h10 m130 0 h10 m-446 0 h20 m426 0 h20 m-466 0 q10 0 10 10 m446 0 q0 -10 10 -10 m-456 10 v24 m446 0 v-24 m-446 24 q0 10 10 10 m426 0 q10 0 10 -10 m-436 10 h10 m58 0 h10 m0 0 h10 m188 0 h10 m0 0 h140 m-436 -10 v20 m446 0 v-20 m-446 20 v24 m446 0 v-24 m-446 24 q0 10 10 10 m426 0 q10 0 10 -10 m-436 10 h10 m44 0 h10 m20 0 h10 m108 0 h10 m0 0 h132 m-280 0 h20 m260 0 h20 m-300 0 q10 0 10 10 m280 0 q0 -10 10 -10 m-290 10 v24 m280 0 v-24 m-280 24 q0 10 10 10 m260 0 q10 0 10 -10 m-270 10 h10 m240 0 h10 m20 -44 h62 m-436 -10 v20 m446 0 v-20 m-446 20 v68 m446 0 v-68 m-446 68 q0 10 10 10 m426 0 q10 0 10 -10 m-436 10 h10 m64 0 h10 m20 0 h10 m82 0 h10 m0 0 h152 m-274 0 h20 m254 0 h20 m-294 0 q10 0 10 10 m274 0 q0 -10 10 -10 m-284 10 v24 m274 0 v-24 m-274 24 q0 10 10 10 m254 0 q10 0 10 -10 m-264 10 h10 m142 0 h10 m0 0 h10 m72 0 h10 m20 -44 h48 m23 -176 h-3"></path>
<polygon points="495 17 503 13 503 21"></polygon>
<polygon points="495 17 487 13 487 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
