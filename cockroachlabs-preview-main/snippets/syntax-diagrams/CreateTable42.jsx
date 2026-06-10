export const CreateTable42 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="503" width="735" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="/docs/v25.4/sql-grammar#opt_persistence_temp_table" xlink:title="opt_persistence_temp_table">
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
<text class="terminal" x="579" y="53">EXISTS</text><a xlink:href="/docs/v25.4/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="33" y="145"></rect>
<rect class="nonterminal" height="32" width="96" x="31" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="43" y="163">table_name</text></a><rect height="32" rx="10" width="26" x="149" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="147" y="143"></rect>
<text class="terminal" x="157" y="163">(</text><a xlink:href="/docs/v25.4/sql-grammar#column_table_def" xlink:title="column_table_def">
<rect height="32" width="134" x="255" y="145"></rect>
<rect class="nonterminal" height="32" width="134" x="253" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="265" y="163">column_table_def</text></a><a xlink:href="/docs/v25.4/sql-grammar#index_def" xlink:title="index_def">
<rect height="32" width="82" x="255" y="189"></rect>
<rect class="nonterminal" height="32" width="82" x="253" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="265" y="207">index_def</text></a><a xlink:href="/docs/v25.4/sql-grammar#family_def" xlink:title="family_def">
<rect height="32" width="86" x="255" y="233"></rect>
<rect class="nonterminal" height="32" width="86" x="253" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="265" y="251">family_def</text></a><a xlink:href="/docs/v25.4/sql-grammar#table_constraint" xlink:title="table_constraint">
<rect height="32" width="124" x="255" y="277"></rect>
<rect class="nonterminal" height="32" width="124" x="253" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="265" y="295">table_constraint</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_validate_behavior" xlink:title="opt_validate_behavior">
<rect height="32" width="162" x="399" y="277"></rect>
<rect class="nonterminal" height="32" width="162" x="397" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="10" class="nonterminal" x="409" y="295">opt_validate_behavior</text></a><rect height="32" rx="10" width="52" x="255" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="253" y="319"></rect>
<text class="terminal" x="263" y="339">LIKE</text><a xlink:href="/docs/v25.4/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="327" y="321"></rect>
<rect class="nonterminal" height="32" width="96" x="325" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="337" y="339">table_name</text></a><a xlink:href="/docs/v25.4/sql-grammar#like_table_option_list" xlink:title="like_table_option_list">
<rect height="32" width="156" x="443" y="321"></rect>
<rect class="nonterminal" height="32" width="156" x="441" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="10" class="nonterminal" x="453" y="339">like_table_option_list</text></a><rect height="32" rx="10" width="24" x="235" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="233" y="99"></rect>
<text class="terminal" x="243" y="119">,</text>
<rect height="32" rx="10" width="26" x="679" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="677" y="143"></rect>
<text class="terminal" x="687" y="163">)</text><a xlink:href="/docs/v25.4/sql-grammar#opt_partition_by_table" xlink:title="opt_partition_by_table">
<rect height="32" width="166" x="25" y="403"></rect>
<rect class="nonterminal" height="32" width="166" x="23" y="401"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="35" y="421">opt_partition_by_table</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="211" y="403"></rect>
<rect class="nonterminal" height="32" width="234" x="209" y="401"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="221" y="421">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="40" x="465" y="403"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="463" y="401"></rect>
<text class="terminal" x="473" y="421">ON</text>
<rect height="32" rx="10" width="78" x="525" y="403"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="523" y="401"></rect>
<text class="terminal" x="533" y="421">COMMIT</text>
<rect height="32" rx="10" width="90" x="623" y="403"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="621" y="401"></rect>
<text class="terminal" x="631" y="421">PRESERVE</text>
<rect height="32" rx="10" width="62" x="533" y="469"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="531" y="467"></rect>
<text class="terminal" x="541" y="487">ROWS</text><a xlink:href="/docs/v25.4/sql-grammar#opt_locality" xlink:title="opt_locality">
<rect height="32" width="92" x="615" y="469"></rect>
<rect class="nonterminal" height="32" width="92" x="613" y="467"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="625" y="487">opt_locality</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m204 0 h10 m0 0 h10 m62 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-672 142 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m96 0 h10 m0 0 h10 m26 0 h10 m60 0 h10 m134 0 h10 m0 0 h210 m-384 0 h20 m364 0 h20 m-404 0 q10 0 10 10 m384 0 q0 -10 10 -10 m-394 10 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m82 0 h10 m0 0 h262 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m86 0 h10 m0 0 h258 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m124 0 h10 m0 0 h10 m162 0 h10 m0 0 h38 m-374 -10 v20 m384 0 v-20 m-384 20 v24 m384 0 v-24 m-384 24 q0 10 10 10 m364 0 q10 0 10 -10 m-374 10 h10 m52 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m156 0 h10 m-404 -176 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m404 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-404 0 h10 m24 0 h10 m0 0 h360 m-444 44 h20 m444 0 h20 m-484 0 q10 0 10 10 m464 0 q0 -10 10 -10 m-474 10 v190 m464 0 v-190 m-464 190 q0 10 10 10 m444 0 q10 0 10 -10 m-454 10 h10 m0 0 h434 m20 -210 h10 m26 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-724 258 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m166 0 h10 m0 0 h10 m234 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m78 0 h10 m0 0 h10 m90 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-224 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m62 0 h10 m0 0 h10 m92 0 h10 m3 0 h-3"></path>
<polygon points="725 483 733 479 733 487"></polygon>
<polygon points="725 483 717 479 717 487"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
