export const ShowRanges = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="311" width="669" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="76" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">RANGES</text>
<rect height="32" rx="10" width="60" x="251" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="249" y="33"></rect>
<text class="terminal" x="259" y="53">FROM</text>
<rect height="32" rx="10" width="64" x="351" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="349" y="33"></rect>
<text class="terminal" x="359" y="53">INDEX</text><a xlink:href="/docs/stable/sql-grammar#table_index_name" xlink:title="table_index_name">
<rect height="32" width="138" x="435" y="35"></rect>
<rect class="nonterminal" height="32" width="138" x="433" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="11" class="nonterminal" x="445" y="53">table_index_name</text></a><rect height="32" rx="10" width="62" x="351" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="349" y="77"></rect>
<text class="terminal" x="359" y="97">TABLE</text><a xlink:href="/docs/stable/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="433" y="79"></rect>
<rect class="nonterminal" height="32" width="96" x="431" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="443" y="97">table_name</text></a><rect height="32" rx="10" width="92" x="351" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="349" y="121"></rect>
<text class="terminal" x="359" y="141">DATABASE</text><a xlink:href="/docs/stable/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="463" y="123"></rect>
<rect class="nonterminal" height="32" width="124" x="461" y="121"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="473" y="141">database_name</text></a><rect height="32" rx="10" width="158" x="351" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="158" x="349" y="165"></rect>
<text class="terminal" x="359" y="185">CURRENT_CATALOG</text>
<rect height="32" rx="10" width="82" x="135" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="133" y="209"></rect>
<text class="terminal" x="143" y="229">CLUSTER</text>
<rect height="32" rx="10" width="76" x="237" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="235" y="209"></rect>
<text class="terminal" x="245" y="229">RANGES</text><a xlink:href="/docs/stable/sql-grammar#opt_show_ranges_options" xlink:title="opt_show_ranges_options">
<rect height="32" width="188" x="453" y="277"></rect>
<rect class="nonterminal" height="32" width="188" x="451" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="11" class="nonterminal" x="463" y="295">opt_show_ranges_options</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m76 0 h10 m20 0 h10 m0 0 h366 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v12 m396 0 v-12 m-396 12 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m60 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m138 0 h10 m0 0 h14 m-276 0 h20 m256 0 h20 m-296 0 q10 0 10 10 m276 0 q0 -10 10 -10 m-286 10 v24 m276 0 v-24 m-276 24 q0 10 10 10 m256 0 q10 0 10 -10 m-266 10 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h58 m-266 -10 v20 m276 0 v-20 m-276 20 v24 m276 0 v-24 m-276 24 q0 10 10 10 m256 0 q10 0 10 -10 m-266 10 h10 m92 0 h10 m0 0 h10 m124 0 h10 m-266 -10 v20 m276 0 v-20 m-276 20 v24 m276 0 v-24 m-276 24 q0 10 10 10 m256 0 q10 0 10 -10 m-266 10 h10 m158 0 h10 m0 0 h78 m-492 -164 h20 m512 0 h20 m-552 0 q10 0 10 10 m532 0 q0 -10 10 -10 m-542 10 v188 m532 0 v-188 m-532 188 q0 10 10 10 m512 0 q10 0 10 -10 m-522 10 h10 m82 0 h10 m0 0 h10 m76 0 h10 m0 0 h314 m22 -208 l2 0 m2 0 l2 0 m2 0 l2 0 m-238 274 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m188 0 h10 m3 0 h-3"></path>
<polygon points="659 291 667 287 667 295"></polygon>
<polygon points="659 291 651 287 651 295"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
