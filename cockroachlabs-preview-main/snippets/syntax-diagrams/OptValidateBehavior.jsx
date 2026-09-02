export const OptValidateBehavior = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="1087" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">CHECK</text>
<rect height="32" rx="10" width="26" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">(</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="181" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="179" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="191" y="21">a_expr</text></a><rect height="32" rx="10" width="26" x="265" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="263" y="1"></rect>
<text class="terminal" x="273" y="21">)</text>
<rect height="32" rx="10" width="74" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">UNIQUE</text>
<rect height="32" rx="10" width="26" x="145" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="143" y="45"></rect>
<text class="terminal" x="153" y="65">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="191" y="47"></rect>
<rect class="nonterminal" height="32" width="110" x="189" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="201" y="65">index_params</text></a><rect height="32" rx="10" width="26" x="321" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="319" y="45"></rect>
<text class="terminal" x="329" y="65">)</text><a xlink:href="#opt_storing" xlink:title="opt_storing">
<rect height="32" width="92" x="367" y="47"></rect>
<rect class="nonterminal" height="32" width="92" x="365" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="377" y="65">opt_storing</text></a><a xlink:href="#opt_partition_by_index" xlink:title="opt_partition_by_index">
<rect height="32" width="168" x="479" y="47"></rect>
<rect class="nonterminal" height="32" width="168" x="477" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="10" class="nonterminal" x="489" y="65">opt_partition_by_index</text></a><a xlink:href="#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="667" y="47"></rect>
<rect class="nonterminal" height="32" width="136" x="665" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="677" y="65">opt_where_clause</text></a><rect height="32" rx="10" width="84" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">PRIMARY</text>
<rect height="32" rx="10" width="46" x="155" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="153" y="89"></rect>
<text class="terminal" x="163" y="109">KEY</text>
<rect height="32" rx="10" width="26" x="221" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="219" y="89"></rect>
<text class="terminal" x="229" y="109">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="267" y="91"></rect>
<rect class="nonterminal" height="32" width="110" x="265" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="277" y="109">index_params</text></a><rect height="32" rx="10" width="26" x="397" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="395" y="89"></rect>
<text class="terminal" x="405" y="109">)</text><a xlink:href="#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="443" y="91"></rect>
<rect class="nonterminal" height="32" width="140" x="441" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="453" y="109">opt_hash_sharded</text></a><a xlink:href="#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="603" y="91"></rect>
<rect class="nonterminal" height="32" width="234" x="601" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="613" y="109">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="82" x="51" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="133"></rect>
<text class="terminal" x="59" y="153">FOREIGN</text>
<rect height="32" rx="10" width="46" x="153" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="151" y="133"></rect>
<text class="terminal" x="161" y="153">KEY</text>
<rect height="32" rx="10" width="26" x="219" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="217" y="133"></rect>
<text class="terminal" x="227" y="153">(</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="265" y="135"></rect>
<rect class="nonterminal" height="32" width="82" x="263" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="275" y="153">name_list</text></a><rect height="32" rx="10" width="26" x="367" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="365" y="133"></rect>
<text class="terminal" x="375" y="153">)</text>
<rect height="32" rx="10" width="108" x="413" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="108" x="411" y="133"></rect>
<text class="terminal" x="421" y="153">REFERENCES</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="541" y="135"></rect>
<rect class="nonterminal" height="32" width="96" x="539" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="551" y="153">table_name</text></a><a xlink:href="#opt_column_list" xlink:title="opt_column_list">
<rect height="32" width="120" x="657" y="135"></rect>
<rect class="nonterminal" height="32" width="120" x="655" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="10" class="nonterminal" x="667" y="153">opt_column_list</text></a><a xlink:href="#key_match" xlink:title="key_match">
<rect height="32" width="88" x="797" y="135"></rect>
<rect class="nonterminal" height="32" width="88" x="795" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="807" y="153">key_match</text></a><a xlink:href="#reference_actions" xlink:title="reference_actions">
<rect height="32" width="134" x="905" y="135"></rect>
<rect class="nonterminal" height="32" width="134" x="903" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="10" class="nonterminal" x="915" y="153">reference_actions</text></a><path class="line" d="m17 17 h2 m20 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h748 m-1028 0 h20 m1008 0 h20 m-1048 0 q10 0 10 10 m1028 0 q0 -10 10 -10 m-1038 10 v24 m1028 0 v-24 m-1028 24 q0 10 10 10 m1008 0 q10 0 10 -10 m-1018 10 h10 m74 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m168 0 h10 m0 0 h10 m136 0 h10 m0 0 h236 m-1018 -10 v20 m1028 0 v-20 m-1028 20 v24 m1028 0 v-24 m-1028 24 q0 10 10 10 m1008 0 q10 0 10 -10 m-1018 10 h10 m84 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m140 0 h10 m0 0 h10 m234 0 h10 m0 0 h202 m-1018 -10 v20 m1028 0 v-20 m-1028 20 v24 m1028 0 v-24 m-1028 24 q0 10 10 10 m1008 0 q10 0 10 -10 m-1018 10 h10 m82 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m120 0 h10 m0 0 h10 m88 0 h10 m0 0 h10 m134 0 h10 m23 -132 h-3"></path>
<polygon points="1077 17 1085 13 1085 21"></polygon>
<polygon points="1077 17 1069 13 1069 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
