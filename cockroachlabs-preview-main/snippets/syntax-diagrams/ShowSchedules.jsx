export const ShowSchedules = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="169" width="727" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="86" x="155" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="153" y="33"></rect>
<text class="terminal" x="163" y="53">RUNNING</text>
<rect height="32" rx="10" width="74" x="155" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="153" y="77"></rect>
<text class="terminal" x="163" y="97">PAUSED</text>
<rect height="32" rx="10" width="100" x="281" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="279" y="1"></rect>
<text class="terminal" x="289" y="21">SCHEDULES</text>
<rect height="32" rx="10" width="48" x="401" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="399" y="1"></rect>
<text class="terminal" x="409" y="21">FOR</text>
<rect height="32" rx="10" width="74" x="489" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="487" y="1"></rect>
<text class="terminal" x="497" y="21">BACKUP</text>
<rect height="32" rx="10" width="48" x="489" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="487" y="45"></rect>
<text class="terminal" x="497" y="65">SQL</text>
<rect height="32" rx="10" width="102" x="557" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="555" y="45"></rect>
<text class="terminal" x="565" y="65">STATISTICS</text>
<rect height="32" rx="10" width="110" x="489" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="487" y="89"></rect>
<text class="terminal" x="497" y="109">CHANGEFEED</text>
<rect height="32" rx="10" width="92" x="135" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="133" y="133"></rect>
<text class="terminal" x="143" y="153">SCHEDULE</text><a xlink:href="/docs/stable/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="247" y="135"></rect>
<rect class="nonterminal" height="32" width="64" x="245" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="257" y="153">a_expr</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m40 0 h10 m0 0 h96 m-126 0 h20 m106 0 h20 m-146 0 q10 0 10 10 m126 0 q0 -10 10 -10 m-136 10 v12 m126 0 v-12 m-126 12 q0 10 10 10 m106 0 q10 0 10 -10 m-116 10 h10 m86 0 h10 m-116 -10 v20 m126 0 v-20 m-126 20 v24 m126 0 v-24 m-126 24 q0 10 10 10 m106 0 q10 0 10 -10 m-116 10 h10 m74 0 h10 m0 0 h12 m20 -76 h10 m100 0 h10 m0 0 h10 m48 0 h10 m20 0 h10 m74 0 h10 m0 0 h96 m-210 0 h20 m190 0 h20 m-230 0 q10 0 10 10 m210 0 q0 -10 10 -10 m-220 10 v24 m210 0 v-24 m-210 24 q0 10 10 10 m190 0 q10 0 10 -10 m-200 10 h10 m48 0 h10 m0 0 h10 m102 0 h10 m-200 -10 v20 m210 0 v-20 m-210 20 v24 m210 0 v-24 m-210 24 q0 10 10 10 m190 0 q10 0 10 -10 m-200 10 h10 m110 0 h10 m0 0 h60 m-564 -88 h20 m564 0 h20 m-604 0 q10 0 10 10 m584 0 q0 -10 10 -10 m-594 10 v112 m584 0 v-112 m-584 112 q0 10 10 10 m564 0 q10 0 10 -10 m-574 10 h10 m92 0 h10 m0 0 h10 m64 0 h10 m0 0 h368 m23 -132 h-3"></path>
<polygon points="717 17 725 13 725 21"></polygon>
<polygon points="717 17 709 13 709 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
