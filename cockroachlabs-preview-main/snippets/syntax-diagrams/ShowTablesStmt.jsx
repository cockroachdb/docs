export const ShowTablesStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="101" width="703" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">TABLES</text>
<rect height="32" rx="10" width="60" x="227" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="225" y="33"></rect>
<text class="terminal" x="235" y="53">FROM</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="307" y="35"></rect>
<rect class="nonterminal" height="32" width="56" x="305" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="317" y="53">name</text></a><rect height="32" rx="10" width="24" x="403" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="401" y="65"></rect>
<text class="terminal" x="411" y="85">.</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="447" y="67"></rect>
<rect class="nonterminal" height="32" width="56" x="445" y="65"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="457" y="85">name</text></a><a xlink:href="#with_comment" xlink:title="with_comment">
<rect height="32" width="112" x="563" y="3"></rect>
<rect class="nonterminal" height="32" width="112" x="561" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="11" class="nonterminal" x="573" y="21">with_comment</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m72 0 h10 m20 0 h10 m0 0 h306 m-336 0 h20 m316 0 h20 m-356 0 q10 0 10 10 m336 0 q0 -10 10 -10 m-346 10 v12 m336 0 v-12 m-336 12 q0 10 10 10 m316 0 q10 0 10 -10 m-326 10 h10 m60 0 h10 m0 0 h10 m56 0 h10 m20 0 h10 m0 0 h110 m-140 0 h20 m120 0 h20 m-160 0 q10 0 10 10 m140 0 q0 -10 10 -10 m-150 10 v12 m140 0 v-12 m-140 12 q0 10 10 10 m120 0 q10 0 10 -10 m-130 10 h10 m24 0 h10 m0 0 h10 m56 0 h10 m40 -64 h10 m112 0 h10 m3 0 h-3"></path>
<polygon points="693 17 701 13 701 21"></polygon>
<polygon points="693 17 685 13 685 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
