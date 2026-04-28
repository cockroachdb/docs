export const ShowLocalityStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="113" width="685" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">SHOW</text><a xlink:href="#schedule_state" xlink:title="schedule_state">
<rect height="32" width="118" x="155" y="35"></rect>
<rect class="nonterminal" height="32" width="118" x="153" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="94" font-size="10" class="nonterminal" x="165" y="53">schedule_state</text></a><rect height="32" rx="10" width="100" x="313" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="311" y="1"></rect>
<text class="terminal" x="321" y="21">SCHEDULES</text><a xlink:href="#opt_schedule_executor_type" xlink:title="opt_schedule_executor_type">
<rect height="32" width="204" x="433" y="3"></rect>
<rect class="nonterminal" height="32" width="204" x="431" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="180" font-size="11" class="nonterminal" x="443" y="21">opt_schedule_executor_type</text></a><rect height="32" rx="10" width="92" x="135" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="133" y="77"></rect>
<text class="terminal" x="143" y="97">SCHEDULE</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="247" y="79"></rect>
<rect class="nonterminal" height="32" width="64" x="245" y="77"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="257" y="97">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m40 0 h10 m0 0 h128 m-158 0 h20 m138 0 h20 m-178 0 q10 0 10 10 m158 0 q0 -10 10 -10 m-168 10 v12 m158 0 v-12 m-158 12 q0 10 10 10 m138 0 q10 0 10 -10 m-148 10 h10 m118 0 h10 m20 -32 h10 m100 0 h10 m0 0 h10 m204 0 h10 m-542 0 h20 m522 0 h20 m-562 0 q10 0 10 10 m542 0 q0 -10 10 -10 m-552 10 v56 m542 0 v-56 m-542 56 q0 10 10 10 m522 0 q10 0 10 -10 m-532 10 h10 m92 0 h10 m0 0 h10 m64 0 h10 m0 0 h326 m23 -76 h-3"></path>
<polygon points="675 17 683 13 683 21"></polygon>
<polygon points="675 17 667 13 667 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
