export const CreateTableAs7 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="469" width="959" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="/docs/v24.1/sql-grammar#opt_persistence_temp_table" xlink:title="opt_persistence_temp_table">
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
<text class="terminal" x="579" y="53">EXISTS</text><a xlink:href="/docs/v24.1/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="433" y="101"></rect>
<rect class="nonterminal" height="32" width="96" x="431" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="443" y="119">table_name</text></a><rect height="32" rx="10" width="26" x="45" y="183"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="43" y="181"></rect>
<text class="terminal" x="53" y="201">(</text><a xlink:href="/docs/v24.1/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="91" y="183"></rect>
<rect class="nonterminal" height="32" width="108" x="89" y="181"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="101" y="201">column_name</text></a><a xlink:href="/docs/v24.1/sql-grammar#create_as_col_qual_list" xlink:title="create_as_col_qual_list">
<rect height="32" width="170" x="219" y="183"></rect>
<rect class="nonterminal" height="32" width="170" x="217" y="181"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="229" y="201">create_as_col_qual_list</text></a><rect height="32" rx="10" width="24" x="449" y="183"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="447" y="181"></rect>
<text class="terminal" x="457" y="201">,</text><a xlink:href="/docs/v24.1/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="513" y="183"></rect>
<rect class="nonterminal" height="32" width="108" x="511" y="181"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="523" y="201">column_name</text></a><a xlink:href="/docs/v24.1/sql-grammar#create_as_col_qual_list" xlink:title="create_as_col_qual_list">
<rect height="32" width="170" x="641" y="183"></rect>
<rect class="nonterminal" height="32" width="170" x="639" y="181"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="651" y="201">create_as_col_qual_list</text></a><a xlink:href="/docs/v24.1/sql-grammar#family_def" xlink:title="family_def">
<rect height="32" width="86" x="513" y="227"></rect>
<rect class="nonterminal" height="32" width="86" x="511" y="225"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="523" y="245">family_def</text></a><a xlink:href="/docs/v24.1/sql-grammar#create_as_constraint_def" xlink:title="create_as_constraint_def">
<rect height="32" width="182" x="513" y="271"></rect>
<rect class="nonterminal" height="32" width="182" x="511" y="269"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="10" class="nonterminal" x="523" y="289">create_as_constraint_def</text></a><rect height="32" rx="10" width="26" x="891" y="183"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="889" y="181"></rect>
<text class="terminal" x="899" y="201">)</text><a xlink:href="/docs/v24.1/sql-grammar#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="144" y="369"></rect>
<rect class="nonterminal" height="32" width="234" x="142" y="367"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="154" y="387">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="38" x="398" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="396" y="367"></rect>
<text class="terminal" x="406" y="387">AS</text><a xlink:href="/docs/v24.1/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="456" y="369"></rect>
<rect class="nonterminal" height="32" width="94" x="454" y="367"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="466" y="387">select_stmt</text></a><rect height="32" rx="10" width="40" x="570" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="568" y="367"></rect>
<text class="terminal" x="578" y="387">ON</text>
<rect height="32" rx="10" width="78" x="630" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="628" y="367"></rect>
<text class="terminal" x="638" y="387">COMMIT</text>
<rect height="32" rx="10" width="90" x="728" y="369"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="726" y="367"></rect>
<text class="terminal" x="736" y="387">PRESERVE</text>
<rect height="32" rx="10" width="62" x="869" y="435"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="867" y="433"></rect>
<text class="terminal" x="877" y="453">ROWS</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m204 0 h10 m0 0 h10 m62 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-272 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m96 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-548 82 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m26 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m170 0 h10 m40 0 h10 m24 0 h10 m20 0 h10 m108 0 h10 m0 0 h10 m170 0 h10 m-338 0 h20 m318 0 h20 m-358 0 q10 0 10 10 m338 0 q0 -10 10 -10 m-348 10 v24 m338 0 v-24 m-338 24 q0 10 10 10 m318 0 q10 0 10 -10 m-328 10 h10 m86 0 h10 m0 0 h212 m-328 -10 v20 m338 0 v-20 m-338 20 v24 m338 0 v-24 m-338 24 q0 10 10 10 m318 0 q10 0 10 -10 m-328 10 h10 m182 0 h10 m0 0 h116 m-402 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m402 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-402 0 h10 m0 0 h392 m-442 32 h20 m442 0 h20 m-482 0 q10 0 10 10 m462 0 q0 -10 10 -10 m-472 10 v102 m462 0 v-102 m-462 102 q0 10 10 10 m442 0 q10 0 10 -10 m-452 10 h10 m0 0 h432 m20 -122 h10 m26 0 h10 m-912 0 h20 m892 0 h20 m-932 0 q10 0 10 10 m912 0 q0 -10 10 -10 m-922 10 v118 m912 0 v-118 m-912 118 q0 10 10 10 m892 0 q10 0 10 -10 m-902 10 h10 m0 0 h882 m22 -138 l2 0 m2 0 l2 0 m2 0 l2 0 m-837 186 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m234 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m78 0 h10 m0 0 h10 m90 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m7 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m62 0 h10 m3 0 h-3"></path>
<polygon points="949 449 957 445 957 453"></polygon>
<polygon points="949 449 941 445 941 453"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
