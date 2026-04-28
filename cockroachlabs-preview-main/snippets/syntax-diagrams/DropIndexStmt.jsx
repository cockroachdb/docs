export const DropIndexStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="135" width="709" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">DROP</text>
<rect height="32" rx="10" width="64" x="109" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="107" y="1"></rect>
<text class="terminal" x="117" y="21">INDEX</text><a xlink:href="#opt_concurrently" xlink:title="opt_concurrently">
<rect height="32" width="126" x="193" y="3"></rect>
<rect class="nonterminal" height="32" width="126" x="191" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="203" y="21">opt_concurrently</text></a><rect height="32" rx="10" width="34" x="359" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="357" y="33"></rect>
<text class="terminal" x="367" y="53">IF</text>
<rect height="32" rx="10" width="70" x="413" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="411" y="33"></rect>
<text class="terminal" x="421" y="53">EXISTS</text><a xlink:href="#table_index_name_list" xlink:title="table_index_name_list">
<rect height="32" width="164" x="523" y="3"></rect>
<rect class="nonterminal" height="32" width="164" x="521" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="10" class="nonterminal" x="533" y="21">table_index_name_list</text></a><a xlink:href="#opt_drop_behavior" xlink:title="opt_drop_behavior">
<rect height="32" width="142" x="539" y="101"></rect>
<rect class="nonterminal" height="32" width="142" x="537" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="549" y="119">opt_drop_behavior</text></a><path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m126 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m164 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-192 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m142 0 h10 m3 0 h-3"></path>
<polygon points="699 115 707 111 707 119"></polygon>
<polygon points="699 115 691 111 691 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
