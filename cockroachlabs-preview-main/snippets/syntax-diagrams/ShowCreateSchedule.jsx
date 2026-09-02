export const ShowCreateSchedule = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="451" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="123" y="21">CREATE</text>
<rect height="32" rx="10" width="44" x="227" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="225" y="1"></rect>
<text class="terminal" x="235" y="21">ALL</text>
<rect height="32" rx="10" width="100" x="291" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="289" y="1"></rect>
<text class="terminal" x="299" y="21">SCHEDULES</text>
<rect height="32" rx="10" width="92" x="227" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="225" y="45"></rect>
<text class="terminal" x="235" y="65">SCHEDULE</text><a xlink:href="/docs/stable/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="339" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="337" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="349" y="65">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m72 0 h10 m20 0 h10 m44 0 h10 m0 0 h10 m100 0 h10 m0 0 h12 m-216 0 h20 m196 0 h20 m-236 0 q10 0 10 10 m216 0 q0 -10 10 -10 m-226 10 v24 m216 0 v-24 m-216 24 q0 10 10 10 m196 0 q10 0 10 -10 m-206 10 h10 m92 0 h10 m0 0 h10 m64 0 h10 m23 -44 h-3"></path>
<polygon points="441 17 449 13 449 21"></polygon>
<polygon points="441 17 433 13 433 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
