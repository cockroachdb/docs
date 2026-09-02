export const AbbreviatedGrantStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="103" width="627" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="66" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">GRANT</text><a xlink:href="#privileges" xlink:title="privileges">
<rect height="32" width="80" x="117" y="3"></rect>
<rect class="nonterminal" height="32" width="80" x="115" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="56" font-size="10" class="nonterminal" x="127" y="21">privileges</text></a><rect height="32" rx="10" width="40" x="217" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="215" y="1"></rect>
<text class="terminal" x="225" y="21">ON</text><a xlink:href="#target_object_type" xlink:title="target_object_type">
<rect height="32" width="142" x="277" y="3"></rect>
<rect class="nonterminal" height="32" width="142" x="275" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="287" y="21">target_object_type</text></a><rect height="32" rx="10" width="38" x="439" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="437" y="1"></rect>
<text class="terminal" x="447" y="21">TO</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="497" y="3"></rect>
<rect class="nonterminal" height="32" width="108" x="495" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="507" y="21">role_spec_list</text></a><a xlink:href="#opt_with_grant_option" xlink:title="opt_with_grant_option">
<rect height="32" width="166" x="433" y="69"></rect>
<rect class="nonterminal" height="32" width="166" x="431" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="443" y="87">opt_with_grant_option</text></a><path class="line" d="m17 17 h2 m0 0 h10 m66 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m142 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m108 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-216 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m166 0 h10 m3 0 h-3"></path>
<polygon points="617 83 625 79 625 87"></polygon>
<polygon points="617 83 609 79 609 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
