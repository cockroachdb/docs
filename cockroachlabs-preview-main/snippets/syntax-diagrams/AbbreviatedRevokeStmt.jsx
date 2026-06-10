export const AbbreviatedRevokeStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="135" width="739" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">REVOKE</text>
<rect height="32" rx="10" width="66" x="145" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="143" y="33"></rect>
<text class="terminal" x="153" y="53">GRANT</text>
<rect height="32" rx="10" width="76" x="231" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="229" y="33"></rect>
<text class="terminal" x="239" y="53">OPTION</text>
<rect height="32" rx="10" width="48" x="327" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="325" y="33"></rect>
<text class="terminal" x="335" y="53">FOR</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="415" y="3"></rect>
<rect class="nonterminal" height="32" width="80" x="413" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="425" y="21">privileges</text></a><rect height="32" rx="10" width="40" x="515" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="513" y="1"></rect>
<text class="terminal" x="523" y="21">ON</text><a xlink:href="#target_object_type" xlink:title="target_object_type">
<rect height="32" width="142" x="575" y="3"></rect>
<rect class="nonterminal" height="32" width="142" x="573" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="585" y="21">target_object_type</text></a><rect height="32" rx="10" width="60" x="361" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="359" y="99"></rect>
<text class="terminal" x="369" y="119">FROM</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="441" y="101"></rect>
<rect class="nonterminal" height="32" width="108" x="439" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="451" y="119">role_spec_list</text></a><a xlink:href="#opt_drop_behavior" xlink:title="opt_drop_behavior">
<rect height="32" width="142" x="569" y="101"></rect>
<rect class="nonterminal" height="32" width="142" x="567" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="579" y="119">opt_drop_behavior</text></a><path class="line" d="m17 17 h2 m0 0 h10 m74 0 h10 m20 0 h10 m0 0 h240 m-270 0 h20 m250 0 h20 m-290 0 q10 0 10 10 m270 0 q0 -10 10 -10 m-280 10 v12 m270 0 v-12 m-270 12 q0 10 10 10 m250 0 q10 0 10 -10 m-260 10 h10 m66 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m48 0 h10 m20 -32 h10 m80 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m142 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-400 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m60 0 h10 m0 0 h10 m108 0 h10 m0 0 h10 m142 0 h10 m3 0 h-3"></path>
<polygon points="729 115 737 111 737 119"></polygon>
<polygon points="729 115 721 111 721 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
