export const GrantStmt2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="475" width="1271" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="66" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">GRANT</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="65" y="69"></rect>
<rect class="nonterminal" height="32" width="80" x="63" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="75" y="87">privileges</text></a><rect height="32" rx="10" width="40" x="165" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="163" y="67"></rect>
<text class="terminal" x="173" y="87">ON</text><a xlink:href="#grant_targets" xlink:title="grant_targets">
<rect height="32" width="108" x="245" y="69"></rect>
<rect class="nonterminal" height="32" width="108" x="243" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="255" y="87">grant_targets</text></a><rect height="32" rx="10" width="54" x="245" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="243" y="111"></rect>
<text class="terminal" x="253" y="131">TYPE</text><a xlink:href="#target_types" xlink:title="target_types">
<rect height="32" width="102" x="319" y="113"></rect>
<rect class="nonterminal" height="32" width="102" x="317" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="329" y="131">target_types</text></a><rect height="32" rx="10" width="44" x="265" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="263" y="187"></rect>
<text class="terminal" x="273" y="207">ALL</text>
<rect height="32" rx="10" width="102" x="349" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="347" y="187"></rect>
<text class="terminal" x="357" y="207">SEQUENCES</text>
<rect height="32" rx="10" width="72" x="349" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="347" y="231"></rect>
<text class="terminal" x="357" y="251">TABLES</text>
<rect height="32" rx="10" width="102" x="349" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="347" y="275"></rect>
<text class="terminal" x="357" y="295">FUNCTIONS</text>
<rect height="32" rx="10" width="112" x="349" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="347" y="319"></rect>
<text class="terminal" x="357" y="339">PROCEDURES</text>
<rect height="32" rx="10" width="36" x="501" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="499" y="187"></rect>
<text class="terminal" x="509" y="207">IN</text>
<rect height="32" rx="10" width="76" x="577" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="575" y="155"></rect>
<text class="terminal" x="585" y="175">SCHEMA</text><a xlink:href="#schema_name_list" xlink:title="schema_name_list">
<rect height="32" width="138" x="673" y="157"></rect>
<rect class="nonterminal" height="32" width="138" x="671" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="683" y="175">schema_name_list</text></a><rect height="32" rx="10" width="74" x="65" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="63" y="363"></rect>
<text class="terminal" x="73" y="383">SYSTEM</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="159" y="365"></rect>
<rect class="nonterminal" height="32" width="80" x="157" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="169" y="383">privileges</text></a><rect height="32" rx="10" width="38" x="871" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="869" y="67"></rect>
<text class="terminal" x="879" y="87">TO</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="929" y="69"></rect>
<rect class="nonterminal" height="32" width="108" x="927" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="939" y="87">role_spec_list</text></a><a xlink:href="#opt_with_grant_option" xlink:title="opt_with_grant_option">
<rect height="32" width="166" x="1057" y="69"></rect>
<rect class="nonterminal" height="32" width="166" x="1055" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="1067" y="87">opt_with_grant_option</text></a><a xlink:href="#privilege_list" xlink:title="privilege_list">
<rect height="32" width="100" x="45" y="409"></rect>
<rect class="nonterminal" height="32" width="100" x="43" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="55" y="427">privilege_list</text></a><rect height="32" rx="10" width="38" x="165" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="163" y="407"></rect>
<text class="terminal" x="173" y="427">TO</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="223" y="409"></rect>
<rect class="nonterminal" height="32" width="108" x="221" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="233" y="427">role_spec_list</text></a><rect height="32" rx="10" width="58" x="371" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="369" y="439"></rect>
<text class="terminal" x="379" y="459">WITH</text>
<rect height="32" rx="10" width="66" x="449" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="447" y="439"></rect>
<text class="terminal" x="457" y="459">ADMIN</text>
<rect height="32" rx="10" width="76" x="535" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="533" y="439"></rect>
<text class="terminal" x="543" y="459">OPTION</text>
<path class="line" d="m19 17 h2 m0 0 h10 m66 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-118 66 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m80 0 h10 m0 0 h10 m40 0 h10 m20 0 h10 m108 0 h10 m0 0 h458 m-606 0 h20 m586 0 h20 m-626 0 q10 0 10 10 m606 0 q0 -10 10 -10 m-616 10 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-596 10 h10 m54 0 h10 m0 0 h10 m102 0 h10 m0 0 h390 m-596 -10 v20 m606 0 v-20 m-606 20 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-576 10 h10 m0 0 h282 m-312 0 h20 m292 0 h20 m-332 0 q10 0 10 10 m312 0 q0 -10 10 -10 m-322 10 v12 m312 0 v-12 m-312 12 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m44 0 h10 m20 0 h10 m102 0 h10 m0 0 h10 m-152 0 h20 m132 0 h20 m-172 0 q10 0 10 10 m152 0 q0 -10 10 -10 m-162 10 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m72 0 h10 m0 0 h40 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m102 0 h10 m0 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m112 0 h10 m20 -132 h10 m36 0 h10 m20 -32 h10 m76 0 h10 m0 0 h10 m138 0 h10 m-786 -88 h20 m786 0 h20 m-826 0 q10 0 10 10 m806 0 q0 -10 10 -10 m-816 10 v276 m806 0 v-276 m-806 276 q0 10 10 10 m786 0 q10 0 10 -10 m-796 10 h10 m74 0 h10 m0 0 h10 m80 0 h10 m0 0 h592 m20 -296 h10 m38 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m166 0 h10 m-1218 0 h20 m1198 0 h20 m-1238 0 q10 0 10 10 m1218 0 q0 -10 10 -10 m-1228 10 v320 m1218 0 v-320 m-1218 320 q0 10 10 10 m1198 0 q10 0 10 -10 m-1208 10 h10 m100 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m108 0 h10 m20 0 h10 m0 0 h250 m-280 0 h20 m260 0 h20 m-300 0 q10 0 10 10 m280 0 q0 -10 10 -10 m-290 10 v12 m280 0 v-12 m-280 12 q0 10 10 10 m260 0 q10 0 10 -10 m-270 10 h10 m58 0 h10 m0 0 h10 m66 0 h10 m0 0 h10 m76 0 h10 m20 -32 h592 m23 -340 h-3"></path>
<polygon points="1261 83 1269 79 1269 87"></polygon>
<polygon points="1261 83 1253 79 1253 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
