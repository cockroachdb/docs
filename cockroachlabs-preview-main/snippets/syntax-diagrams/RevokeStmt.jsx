export const RevokeStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="925" width="1143" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="74" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">REVOKE</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="45" y="69"></rect>
<rect class="nonterminal" height="32" width="80" x="43" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="55" y="87">privileges</text></a><rect height="32" rx="10" width="40" x="145" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="143" y="67"></rect>
<text class="terminal" x="153" y="87">ON</text><a xlink:href="#grant_targets" xlink:title="grant_targets">
<rect height="32" width="108" x="225" y="69"></rect>
<rect class="nonterminal" height="32" width="108" x="223" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="235" y="87">grant_targets</text></a><rect height="32" rx="10" width="54" x="225" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="223" y="111"></rect>
<text class="terminal" x="233" y="131">TYPE</text><a xlink:href="#target_types" xlink:title="target_types">
<rect height="32" width="102" x="299" y="113"></rect>
<rect class="nonterminal" height="32" width="102" x="297" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="309" y="131">target_types</text></a><rect height="32" rx="10" width="44" x="245" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="243" y="187"></rect>
<text class="terminal" x="253" y="207">ALL</text>
<rect height="32" rx="10" width="72" x="329" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="327" y="187"></rect>
<text class="terminal" x="337" y="207">TABLES</text>
<rect height="32" rx="10" width="102" x="329" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="327" y="231"></rect>
<text class="terminal" x="337" y="251">SEQUENCES</text>
<rect height="32" rx="10" width="102" x="329" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="327" y="275"></rect>
<text class="terminal" x="337" y="295">FUNCTIONS</text>
<rect height="32" rx="10" width="112" x="329" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="327" y="319"></rect>
<text class="terminal" x="337" y="339">PROCEDURES</text>
<rect height="32" rx="10" width="92" x="329" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="327" y="363"></rect>
<text class="terminal" x="337" y="383">ROUTINES</text>
<rect height="32" rx="10" width="36" x="481" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="479" y="187"></rect>
<text class="terminal" x="489" y="207">IN</text>
<rect height="32" rx="10" width="76" x="557" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="555" y="155"></rect>
<text class="terminal" x="565" y="175">SCHEMA</text><a xlink:href="#schema_name_list" xlink:title="schema_name_list">
<rect height="32" width="138" x="653" y="157"></rect>
<rect class="nonterminal" height="32" width="138" x="651" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="663" y="175">schema_name_list</text></a><rect height="32" rx="10" width="66" x="65" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="63" y="439"></rect>
<text class="terminal" x="73" y="459">ADMIN</text>
<rect height="32" rx="10" width="76" x="151" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="149" y="439"></rect>
<text class="terminal" x="159" y="459">OPTION</text>
<rect height="32" rx="10" width="48" x="247" y="441"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="245" y="439"></rect>
<text class="terminal" x="255" y="459">FOR</text><a xlink:href="#privilege_list" xlink:title="privilege_list">
<rect height="32" width="100" x="335" y="409"></rect>
<rect class="nonterminal" height="32" width="100" x="333" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="10" class="nonterminal" x="345" y="427">privilege_list</text></a><rect height="32" rx="10" width="74" x="45" y="485"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="43" y="483"></rect>
<text class="terminal" x="53" y="503">SYSTEM</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="139" y="485"></rect>
<rect class="nonterminal" height="32" width="80" x="137" y="483"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="149" y="503">privileges</text></a><rect height="32" rx="10" width="66" x="45" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="43" y="527"></rect>
<text class="terminal" x="53" y="547">GRANT</text>
<rect height="32" rx="10" width="76" x="131" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="129" y="527"></rect>
<text class="terminal" x="139" y="547">OPTION</text>
<rect height="32" rx="10" width="48" x="227" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="225" y="527"></rect>
<text class="terminal" x="235" y="547">FOR</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="315" y="529"></rect>
<rect class="nonterminal" height="32" width="80" x="313" y="527"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="325" y="547">privileges</text></a><rect height="32" rx="10" width="40" x="415" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="413" y="527"></rect>
<text class="terminal" x="423" y="547">ON</text><a xlink:href="#grant_targets" xlink:title="grant_targets">
<rect height="32" width="108" x="495" y="529"></rect>
<rect class="nonterminal" height="32" width="108" x="493" y="527"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="505" y="547">grant_targets</text></a><rect height="32" rx="10" width="54" x="495" y="573"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="493" y="571"></rect>
<text class="terminal" x="503" y="591">TYPE</text><a xlink:href="#target_types" xlink:title="target_types">
<rect height="32" width="102" x="569" y="573"></rect>
<rect class="nonterminal" height="32" width="102" x="567" y="571"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="579" y="591">target_types</text></a><rect height="32" rx="10" width="44" x="515" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="513" y="647"></rect>
<text class="terminal" x="523" y="667">ALL</text>
<rect height="32" rx="10" width="72" x="599" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="597" y="647"></rect>
<text class="terminal" x="607" y="667">TABLES</text>
<rect height="32" rx="10" width="102" x="599" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="597" y="691"></rect>
<text class="terminal" x="607" y="711">FUNCTIONS</text>
<rect height="32" rx="10" width="112" x="599" y="737"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="597" y="735"></rect>
<text class="terminal" x="607" y="755">PROCEDURES</text>
<rect height="32" rx="10" width="92" x="599" y="781"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="597" y="779"></rect>
<text class="terminal" x="607" y="799">ROUTINES</text>
<rect height="32" rx="10" width="36" x="751" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="749" y="647"></rect>
<text class="terminal" x="759" y="667">IN</text>
<rect height="32" rx="10" width="76" x="827" y="617"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="825" y="615"></rect>
<text class="terminal" x="835" y="635">SCHEMA</text><a xlink:href="#schema_name_list" xlink:title="schema_name_list">
<rect height="32" width="138" x="923" y="617"></rect>
<rect class="nonterminal" height="32" width="138" x="921" y="615"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="933" y="635">schema_name_list</text></a><rect height="32" rx="10" width="74" x="315" y="825"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="313" y="823"></rect>
<text class="terminal" x="323" y="843">SYSTEM</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="409" y="825"></rect>
<rect class="nonterminal" height="32" width="80" x="407" y="823"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="419" y="843">privileges</text></a><rect height="32" rx="10" width="60" x="927" y="891"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="925" y="889"></rect>
<text class="terminal" x="935" y="909">FROM</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="1007" y="891"></rect>
<rect class="nonterminal" height="32" width="108" x="1005" y="889"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="1017" y="909">role_spec_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m74 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-124 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m80 0 h10 m0 0 h10 m40 0 h10 m20 0 h10 m108 0 h10 m0 0 h458 m-606 0 h20 m586 0 h20 m-626 0 q10 0 10 10 m606 0 q0 -10 10 -10 m-616 10 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-596 10 h10 m54 0 h10 m0 0 h10 m102 0 h10 m0 0 h390 m-596 -10 v20 m606 0 v-20 m-606 20 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-576 10 h10 m0 0 h282 m-312 0 h20 m292 0 h20 m-332 0 q10 0 10 10 m312 0 q0 -10 10 -10 m-322 10 v12 m312 0 v-12 m-312 12 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m44 0 h10 m20 0 h10 m72 0 h10 m0 0 h40 m-152 0 h20 m132 0 h20 m-172 0 q10 0 10 10 m152 0 q0 -10 10 -10 m-162 10 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m102 0 h10 m0 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m102 0 h10 m0 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m112 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m92 0 h10 m0 0 h20 m20 -176 h10 m36 0 h10 m20 -32 h10 m76 0 h10 m0 0 h10 m138 0 h10 m20 -88 h290 m-1096 0 h20 m1076 0 h20 m-1116 0 q10 0 10 10 m1096 0 q0 -10 10 -10 m-1106 10 v320 m1096 0 v-320 m-1096 320 q0 10 10 10 m1076 0 q10 0 10 -10 m-1066 10 h10 m0 0 h240 m-270 0 h20 m250 0 h20 m-290 0 q10 0 10 10 m270 0 q0 -10 10 -10 m-280 10 v12 m270 0 v-12 m-270 12 q0 10 10 10 m250 0 q10 0 10 -10 m-260 10 h10 m66 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m48 0 h10 m20 -32 h10 m100 0 h10 m0 0 h666 m-1086 -10 v20 m1096 0 v-20 m-1096 20 v56 m1096 0 v-56 m-1096 56 q0 10 10 10 m1076 0 q10 0 10 -10 m-1086 10 h10 m74 0 h10 m0 0 h10 m80 0 h10 m0 0 h882 m-1086 -10 v20 m1096 0 v-20 m-1096 20 v24 m1096 0 v-24 m-1096 24 q0 10 10 10 m1076 0 q10 0 10 -10 m-1086 10 h10 m66 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m48 0 h10 m20 0 h10 m80 0 h10 m0 0 h10 m40 0 h10 m20 0 h10 m108 0 h10 m0 0 h458 m-606 0 h20 m586 0 h20 m-626 0 q10 0 10 10 m606 0 q0 -10 10 -10 m-616 10 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-596 10 h10 m54 0 h10 m0 0 h10 m102 0 h10 m0 0 h390 m-596 -10 v20 m606 0 v-20 m-606 20 v24 m606 0 v-24 m-606 24 q0 10 10 10 m586 0 q10 0 10 -10 m-576 10 h10 m0 0 h282 m-312 0 h20 m292 0 h20 m-332 0 q10 0 10 10 m312 0 q0 -10 10 -10 m-322 10 v12 m312 0 v-12 m-312 12 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m44 0 h10 m20 0 h10 m72 0 h10 m0 0 h40 m-152 0 h20 m132 0 h20 m-172 0 q10 0 10 10 m152 0 q0 -10 10 -10 m-162 10 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m102 0 h10 m0 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m112 0 h10 m-142 -10 v20 m152 0 v-20 m-152 20 v24 m152 0 v-24 m-152 24 q0 10 10 10 m132 0 q10 0 10 -10 m-142 10 h10 m92 0 h10 m0 0 h20 m20 -132 h10 m36 0 h10 m20 -32 h10 m76 0 h10 m0 0 h10 m138 0 h10 m-786 -88 h20 m786 0 h20 m-826 0 q10 0 10 10 m806 0 q0 -10 10 -10 m-816 10 v276 m806 0 v-276 m-806 276 q0 10 10 10 m786 0 q10 0 10 -10 m-796 10 h10 m74 0 h10 m0 0 h10 m80 0 h10 m0 0 h592 m42 -756 l2 0 m2 0 l2 0 m2 0 l2 0 m-238 822 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m60 0 h10 m0 0 h10 m108 0 h10 m3 0 h-3"></path>
<polygon points="1133 905 1141 901 1141 909"></polygon>
<polygon points="1133 905 1125 901 1125 909"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
