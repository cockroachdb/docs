export const ShowBackupStmt2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="443" width="1215" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">SHOW</text>
<rect height="32" rx="10" width="84" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">BACKUPS</text>
<rect height="32" rx="10" width="36" x="149" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="147" y="67"></rect>
<text class="terminal" x="157" y="87">IN</text><a xlink:href="#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="205" y="69"></rect>
<rect class="nonterminal" height="32" width="214" x="203" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="215" y="87">string_or_placeholder_opt_list</text></a><rect height="32" rx="10" width="74" x="45" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="43" y="111"></rect>
<text class="terminal" x="53" y="131">BACKUP</text><a xlink:href="#show_backup_details" xlink:title="show_backup_details">
<rect height="32" width="156" x="179" y="113"></rect>
<rect class="nonterminal" height="32" width="156" x="177" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="11" class="nonterminal" x="189" y="131">show_backup_details</text></a><rect height="32" rx="10" width="60" x="355" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="353" y="111"></rect>
<text class="terminal" x="363" y="131">FROM</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="435" y="113"></rect>
<rect class="nonterminal" height="32" width="158" x="433" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="445" y="131">string_or_placeholder</text></a><rect height="32" rx="10" width="36" x="613" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="611" y="111"></rect>
<text class="terminal" x="621" y="131">IN</text><a xlink:href="#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="669" y="113"></rect>
<rect class="nonterminal" height="32" width="214" x="667" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="679" y="131">string_or_placeholder_opt_list</text></a><rect height="32" rx="10" width="86" x="199" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="197" y="155"></rect>
<text class="terminal" x="207" y="175">SCHEMAS</text>
<rect height="32" rx="10" width="60" x="199" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="197" y="199"></rect>
<text class="terminal" x="207" y="219">FILES</text>
<rect height="32" rx="10" width="76" x="199" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="197" y="243"></rect>
<text class="terminal" x="207" y="263">RANGES</text>
<rect height="32" rx="10" width="88" x="199" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="197" y="287"></rect>
<text class="terminal" x="207" y="307">VALIDATE</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="327" y="157"></rect>
<rect class="nonterminal" height="32" width="158" x="325" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="337" y="175">string_or_placeholder</text></a><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="179" y="333"></rect>
<rect class="nonterminal" height="32" width="158" x="177" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="189" y="351">string_or_placeholder</text></a><rect height="32" rx="10" width="36" x="377" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="375" y="363"></rect>
<text class="terminal" x="385" y="383">IN</text><a xlink:href="#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="433" y="365"></rect>
<rect class="nonterminal" height="32" width="214" x="431" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="443" y="383">string_or_placeholder_opt_list</text></a><a xlink:href="#opt_with_show_backup_options" xlink:title="opt_with_show_backup_options">
<rect height="32" width="224" x="923" y="113"></rect>
<rect class="nonterminal" height="32" width="224" x="921" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="200" font-size="11" class="nonterminal" x="933" y="131">opt_with_show_backup_options</text></a><rect height="32" rx="10" width="112" x="159" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="157" y="407"></rect>
<text class="terminal" x="167" y="427">CONNECTION</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="291" y="409"></rect>
<rect class="nonterminal" height="32" width="158" x="289" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="301" y="427">string_or_placeholder</text></a><a xlink:href="#opt_with_show_backup_connection_options_list" xlink:title="opt_with_show_backup_connection_options_list">
<rect height="32" width="328" x="469" y="409"></rect>
<rect class="nonterminal" height="32" width="328" x="467" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="304" font-size="11" class="nonterminal" x="479" y="427">opt_with_show_backup_connection_options_list</text></a><path class="line" d="m19 17 h2 m0 0 h10 m64 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-116 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m84 0 h10 m0 0 h10 m36 0 h10 m0 0 h10 m214 0 h10 m0 0 h748 m-1162 0 h20 m1142 0 h20 m-1182 0 q10 0 10 10 m1162 0 q0 -10 10 -10 m-1172 10 v24 m1162 0 v-24 m-1162 24 q0 10 10 10 m1142 0 q10 0 10 -10 m-1152 10 h10 m74 0 h10 m40 0 h10 m156 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m158 0 h10 m0 0 h10 m36 0 h10 m0 0 h10 m214 0 h10 m-744 0 h20 m724 0 h20 m-764 0 q10 0 10 10 m744 0 q0 -10 10 -10 m-754 10 v24 m744 0 v-24 m-744 24 q0 10 10 10 m724 0 q10 0 10 -10 m-714 10 h10 m86 0 h10 m0 0 h2 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m60 0 h10 m0 0 h28 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m76 0 h10 m0 0 h12 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m20 -132 h10 m158 0 h10 m0 0 h398 m-734 -10 v20 m744 0 v-20 m-744 20 v156 m744 0 v-156 m-744 156 q0 10 10 10 m724 0 q10 0 10 -10 m-734 10 h10 m158 0 h10 m20 0 h10 m0 0 h280 m-310 0 h20 m290 0 h20 m-330 0 q10 0 10 10 m310 0 q0 -10 10 -10 m-320 10 v12 m310 0 v-12 m-310 12 q0 10 10 10 m290 0 q10 0 10 -10 m-300 10 h10 m36 0 h10 m0 0 h10 m214 0 h10 m20 -32 h216 m20 -220 h10 m224 0 h10 m-1028 0 h20 m1008 0 h20 m-1048 0 q10 0 10 10 m1028 0 q0 -10 10 -10 m-1038 10 v276 m1028 0 v-276 m-1028 276 q0 10 10 10 m1008 0 q10 0 10 -10 m-1018 10 h10 m112 0 h10 m0 0 h10 m158 0 h10 m0 0 h10 m328 0 h10 m0 0 h350 m43 -340 h-3"></path>
<polygon points="1205 83 1213 79 1213 87"></polygon>
<polygon points="1205 83 1197 79 1197 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
