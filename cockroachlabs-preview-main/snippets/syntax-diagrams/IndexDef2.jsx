export const IndexDef2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="321" width="931" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="71" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="69" y="1"></rect>
<text class="terminal" x="79" y="21">INDEX</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="175" y="35"></rect>
<rect class="nonterminal" height="32" width="56" x="173" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="185" y="53">name</text></a><rect height="32" rx="10" width="74" x="71" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="69" y="77"></rect>
<text class="terminal" x="79" y="97">UNIQUE</text>
<rect height="32" rx="10" width="64" x="165" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="163" y="77"></rect>
<text class="terminal" x="173" y="97">INDEX</text><a xlink:href="#opt_index_name" xlink:title="opt_index_name">
<rect height="32" width="126" x="249" y="79"></rect>
<rect class="nonterminal" height="32" width="126" x="247" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="11" class="nonterminal" x="259" y="97">opt_index_name</text></a><rect height="32" rx="10" width="26" x="415" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="413" y="1"></rect>
<text class="terminal" x="423" y="21">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="461" y="3"></rect>
<rect class="nonterminal" height="32" width="110" x="459" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="471" y="21">index_params</text></a><rect height="32" rx="10" width="26" x="591" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="589" y="1"></rect>
<text class="terminal" x="599" y="21">)</text><a xlink:href="#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="637" y="3"></rect>
<rect class="nonterminal" height="32" width="140" x="635" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="647" y="21">opt_hash_sharded</text></a><a xlink:href="#opt_storing" xlink:title="opt_storing">
<rect height="32" width="92" x="797" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="795" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="807" y="21">opt_storing</text></a><rect height="32" rx="10" width="90" x="51" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="49" y="121"></rect>
<text class="terminal" x="59" y="141">INVERTED</text>
<rect height="32" rx="10" width="64" x="161" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="159" y="121"></rect>
<text class="terminal" x="169" y="141">INDEX</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="265" y="155"></rect>
<rect class="nonterminal" height="32" width="56" x="263" y="153"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="275" y="173">name</text></a><rect height="32" rx="10" width="26" x="361" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="359" y="121"></rect>
<text class="terminal" x="369" y="141">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="407" y="123"></rect>
<rect class="nonterminal" height="32" width="110" x="405" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="417" y="141">index_params</text></a><rect height="32" rx="10" width="26" x="537" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="535" y="121"></rect>
<text class="terminal" x="545" y="141">)</text><a xlink:href="#opt_partition_by_index" xlink:title="opt_partition_by_index">
<rect height="32" width="168" x="178" y="221"></rect>
<rect class="nonterminal" height="32" width="168" x="176" y="219"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="10" class="nonterminal" x="188" y="239">opt_partition_by_index</text></a><a xlink:href="#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="366" y="221"></rect>
<rect class="nonterminal" height="32" width="234" x="364" y="219"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="376" y="239">opt_with_storage_parameter_list</text></a><a xlink:href="#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="620" y="221"></rect>
<rect class="nonterminal" height="32" width="136" x="618" y="219"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="630" y="239">opt_where_clause</text></a><a xlink:href="#opt_index_visible" xlink:title="opt_index_visible">
<rect height="32" width="130" x="773" y="287"></rect>
<rect class="nonterminal" height="32" width="130" x="771" y="285"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="783" y="305">opt_index_visible</text></a><path class="line" d="m17 17 h2 m40 0 h10 m64 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m20 -32 h124 m-344 0 h20 m324 0 h20 m-364 0 q10 0 10 10 m344 0 q0 -10 10 -10 m-354 10 v56 m344 0 v-56 m-344 56 q0 10 10 10 m324 0 q10 0 10 -10 m-334 10 h10 m74 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m126 0 h10 m20 -76 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m140 0 h10 m0 0 h10 m92 0 h10 m-878 0 h20 m858 0 h20 m-898 0 q10 0 10 10 m878 0 q0 -10 10 -10 m-888 10 v100 m878 0 v-100 m-878 100 q0 10 10 10 m858 0 q10 0 10 -10 m-868 10 h10 m90 0 h10 m0 0 h10 m64 0 h10 m20 0 h10 m0 0 h66 m-96 0 h20 m76 0 h20 m-116 0 q10 0 10 10 m96 0 q0 -10 10 -10 m-106 10 v12 m96 0 v-12 m-96 12 q0 10 10 10 m76 0 q10 0 10 -10 m-86 10 h10 m56 0 h10 m20 -32 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h326 m22 -120 l2 0 m2 0 l2 0 m2 0 l2 0 m-775 218 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m168 0 h10 m0 0 h10 m234 0 h10 m0 0 h10 m136 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-27 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="921 301 929 297 929 305"></polygon>
<polygon points="921 301 913 297 913 305"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
