export const ImportStmt = () => {
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
<rect height="32" rx="10" width="76" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">IMPORT</text>
<rect height="32" rx="10" width="56" x="127" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="125" y="1"></rect>
<text class="terminal" x="135" y="21">INTO</text><a xlink:href="#table_name" xlink:title="table_name">
<rect height="32" width="96" x="203" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="201" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="213" y="21">table_name</text></a><rect height="32" rx="10" width="26" x="339" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="337" y="33"></rect>
<text class="terminal" x="347" y="53">(</text><a xlink:href="#insert_column_list" xlink:title="insert_column_list">
<rect height="32" width="136" x="385" y="35"></rect>
<rect class="nonterminal" height="32" width="136" x="383" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="395" y="53">insert_column_list</text></a><rect height="32" rx="10" width="26" x="541" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="539" y="33"></rect>
<text class="terminal" x="549" y="53">)</text><a xlink:href="#import_format" xlink:title="import_format">
<rect height="32" width="110" x="607" y="3"></rect>
<rect class="nonterminal" height="32" width="110" x="605" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="617" y="21">import_format</text></a><rect height="32" rx="10" width="56" x="207" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="205" y="99"></rect>
<text class="terminal" x="215" y="119">DATA</text>
<rect height="32" rx="10" width="26" x="283" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="281" y="99"></rect>
<text class="terminal" x="291" y="119">(</text><a xlink:href="#string_or_placeholder_list" xlink:title="string_or_placeholder_list">
<rect height="32" width="186" x="329" y="101"></rect>
<rect class="nonterminal" height="32" width="186" x="327" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="10" class="nonterminal" x="339" y="119">string_or_placeholder_list</text></a><rect height="32" rx="10" width="26" x="535" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="533" y="99"></rect>
<text class="terminal" x="543" y="119">)</text><a xlink:href="#opt_with_options" xlink:title="opt_with_options">
<rect height="32" width="130" x="581" y="101"></rect>
<rect class="nonterminal" height="32" width="130" x="579" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="591" y="119">opt_with_options</text></a><path class="line" d="m17 17 h2 m0 0 h10 m76 0 h10 m0 0 h10 m56 0 h10 m0 0 h10 m96 0 h10 m20 0 h10 m0 0 h238 m-268 0 h20 m248 0 h20 m-288 0 q10 0 10 10 m268 0 q0 -10 10 -10 m-278 10 v12 m268 0 v-12 m-268 12 q0 10 10 10 m248 0 q10 0 10 -10 m-258 10 h10 m26 0 h10 m0 0 h10 m136 0 h10 m0 0 h10 m26 0 h10 m20 -32 h10 m110 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-554 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m56 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m186 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="729 115 737 111 737 119"></polygon>
<polygon points="729 115 721 111 721 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
