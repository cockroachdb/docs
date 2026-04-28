export const ShowPartitions2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="709" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="106" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">PARTITIONS</text>
<rect height="32" rx="10" width="60" x="241" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="239" y="1"></rect>
<text class="terminal" x="249" y="21">FROM</text>
<rect height="32" rx="10" width="62" x="341" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="339" y="1"></rect>
<text class="terminal" x="349" y="21">TABLE</text><a xlink:href="/docs/v23.2/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="423" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="421" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="433" y="21">table_name</text></a><rect height="32" rx="10" width="92" x="341" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="339" y="45"></rect>
<text class="terminal" x="349" y="65">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="453" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="451" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="463" y="65">database_name</text></a><rect height="32" rx="10" width="64" x="341" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="339" y="89"></rect>
<text class="terminal" x="349" y="109">INDEX</text><a xlink:href="/docs/v23.2/sql-grammar#table_index_name" xlink:title="table_index_name">
<rect height="32" width="138" x="445" y="91"></rect>
<rect class="nonterminal" height="32" width="138" x="443" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="455" y="109">table_index_name</text></a><a xlink:href="/docs/v23.2/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="445" y="135"></rect>
<rect class="nonterminal" height="32" width="96" x="443" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="455" y="153">table_name</text></a><rect height="32" rx="10" width="32" x="561" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="559" y="133"></rect>
<text class="terminal" x="569" y="153">@</text>
<rect height="32" rx="10" width="28" x="613" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="611" y="133"></rect>
<text class="terminal" x="621" y="153">*</text>
<path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m106 0 h10 m0 0 h10 m60 0 h10 m20 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h142 m-360 0 h20 m340 0 h20 m-380 0 q10 0 10 10 m360 0 q0 -10 10 -10 m-370 10 v24 m360 0 v-24 m-360 24 q0 10 10 10 m340 0 q10 0 10 -10 m-350 10 h10 m92 0 h10 m0 0 h10 m124 0 h10 m0 0 h84 m-350 -10 v20 m360 0 v-20 m-360 20 v24 m360 0 v-24 m-360 24 q0 10 10 10 m340 0 q10 0 10 -10 m-350 10 h10 m64 0 h10 m20 0 h10 m138 0 h10 m0 0 h58 m-236 0 h20 m216 0 h20 m-256 0 q10 0 10 10 m236 0 q0 -10 10 -10 m-246 10 v24 m236 0 v-24 m-236 24 q0 10 10 10 m216 0 q10 0 10 -10 m-226 10 h10 m96 0 h10 m0 0 h10 m32 0 h10 m0 0 h10 m28 0 h10 m43 -132 h-3"></path>
<polygon points="699 17 707 13 707 21"></polygon>
<polygon points="699 17 691 13 691 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
