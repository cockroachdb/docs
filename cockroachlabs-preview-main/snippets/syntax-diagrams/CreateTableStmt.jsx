export const CreateTableStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="201" width="721" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="#opt_persistence_temp_table" xlink:title="opt_persistence_temp_table">
<rect height="32" width="204" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="204" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="180" font-size="11" class="nonterminal" x="133" y="21">opt_persistence_temp_table</text></a><rect height="32" rx="10" width="62" x="347" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="345" y="1"></rect>
<text class="terminal" x="355" y="21">TABLE</text>
<rect height="32" rx="10" width="34" x="449" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="447" y="33"></rect>
<text class="terminal" x="457" y="53">IF</text>
<rect height="32" rx="10" width="48" x="503" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="501" y="33"></rect>
<text class="terminal" x="511" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="571" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="569" y="33"></rect>
<text class="terminal" x="579" y="53">EXISTS</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="25" y="101"></rect>
<rect class="nonterminal" height="32" width="96" x="23" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="35" y="119">table_name</text></a><rect height="32" rx="10" width="26" x="141" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="139" y="99"></rect>
<text class="terminal" x="149" y="119">(</text><a xlink:href="#opt_table_elem_list" xlink:title="opt_table_elem_list">
<rect height="32" width="146" x="187" y="101"></rect>
<rect class="nonterminal" height="32" width="146" x="185" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="122" font-size="10" class="nonterminal" x="197" y="119">opt_table_elem_list</text></a><rect height="32" rx="10" width="26" x="353" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="351" y="99"></rect>
<text class="terminal" x="361" y="119">)</text><a xlink:href="#opt_partition_by_table" xlink:title="opt_partition_by_table">
<rect height="32" width="166" x="399" y="101"></rect>
<rect class="nonterminal" height="32" width="166" x="397" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="409" y="119">opt_partition_by_table</text></a><a xlink:href="#opt_table_with" xlink:title="opt_table_with">
<rect height="32" width="114" x="585" y="101"></rect>
<rect class="nonterminal" height="32" width="114" x="583" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="595" y="119">opt_table_with</text></a><a xlink:href="#opt_create_table_on_commit" xlink:title="opt_create_table_on_commit">
<rect height="32" width="206" x="375" y="167"></rect>
<rect class="nonterminal" height="32" width="206" x="373" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="182" font-size="11" class="nonterminal" x="385" y="185">opt_create_table_on_commit</text></a><a xlink:href="#opt_locality" xlink:title="opt_locality">
<rect height="32" width="92" x="601" y="167"></rect>
<rect class="nonterminal" height="32" width="92" x="599" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="611" y="185">opt_locality</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m204 0 h10 m0 0 h10 m62 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-680 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m146 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m166 0 h10 m0 0 h10 m114 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-368 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m206 0 h10 m0 0 h10 m92 0 h10 m3 0 h-3"></path>
<polygon points="711 181 719 177 719 185"></polygon>
<polygon points="711 181 703 177 703 185"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
