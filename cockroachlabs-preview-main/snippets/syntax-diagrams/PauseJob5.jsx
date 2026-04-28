export const PauseJob5 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="299" width="745" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="64" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">PAUSE</text>
<rect height="32" rx="10" width="46" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">JOB</text>
<rect height="32" width="58" x="111" y="69"></rect>
<rect class="nonterminal" height="32" width="58" x="109" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="34" font-size="10" class="nonterminal" x="121" y="87">job_id</text><rect height="32" rx="10" width="58" x="209" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="207" y="99"></rect>
<text class="terminal" x="217" y="119">WITH</text>
<rect height="32" rx="10" width="76" x="287" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="285" y="99"></rect>
<text class="terminal" x="295" y="119">REASON</text>
<rect height="32" rx="10" width="30" x="383" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="381" y="99"></rect>
<text class="terminal" x="391" y="119">=</text><a xlink:href="/docs/v24.3/sql-grammar#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="433" y="101"></rect>
<rect class="nonterminal" height="32" width="158" x="431" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="443" y="119">string_or_placeholder</text></a><rect height="32" rx="10" width="56" x="45" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="43" y="143"></rect>
<text class="terminal" x="53" y="163">JOBS</text><a xlink:href="/docs/v24.3/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="141" y="145"></rect>
<rect class="nonterminal" height="32" width="94" x="139" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="151" y="163">select_stmt</text></a><rect height="32" rx="10" width="58" x="275" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="273" y="175"></rect>
<text class="terminal" x="283" y="195">WITH</text>
<rect height="32" rx="10" width="76" x="353" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="351" y="175"></rect>
<text class="terminal" x="361" y="195">REASON</text>
<rect height="32" rx="10" width="30" x="449" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="447" y="175"></rect>
<text class="terminal" x="457" y="195">=</text><a xlink:href="/docs/v24.3/sql-grammar#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="499" y="177"></rect>
<rect class="nonterminal" height="32" width="158" x="497" y="175"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="509" y="195">string_or_placeholder</text></a><rect height="32" rx="10" width="48" x="141" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="139" y="219"></rect>
<text class="terminal" x="149" y="239">FOR</text>
<rect height="32" rx="10" width="100" x="229" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="227" y="219"></rect>
<text class="terminal" x="237" y="239">SCHEDULES</text><a xlink:href="/docs/v24.3/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="349" y="221"></rect>
<rect class="nonterminal" height="32" width="94" x="347" y="219"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="359" y="239">select_stmt</text></a><rect height="32" rx="10" width="92" x="229" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="227" y="263"></rect>
<text class="terminal" x="237" y="283">SCHEDULE</text>
<rect height="32" width="58" x="341" y="265"></rect>
<rect class="nonterminal" height="32" width="58" x="339" y="263"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="34" font-size="10" class="nonterminal" x="351" y="283">job_id</text><path class="line" d="m19 17 h2 m0 0 h10 m64 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-116 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m46 0 h10 m0 0 h10 m58 0 h10 m20 0 h10 m0 0 h392 m-422 0 h20 m402 0 h20 m-442 0 q10 0 10 10 m422 0 q0 -10 10 -10 m-432 10 v12 m422 0 v-12 m-422 12 q0 10 10 10 m402 0 q10 0 10 -10 m-412 10 h10 m58 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m158 0 h10 m20 -32 h86 m-692 0 h20 m672 0 h20 m-712 0 q10 0 10 10 m692 0 q0 -10 10 -10 m-702 10 v56 m692 0 v-56 m-692 56 q0 10 10 10 m672 0 q10 0 10 -10 m-682 10 h10 m56 0 h10 m20 0 h10 m94 0 h10 m20 0 h10 m0 0 h392 m-422 0 h20 m402 0 h20 m-442 0 q10 0 10 10 m422 0 q0 -10 10 -10 m-432 10 v12 m422 0 v-12 m-422 12 q0 10 10 10 m402 0 q10 0 10 -10 m-412 10 h10 m58 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m158 0 h10 m-556 -32 h20 m556 0 h20 m-596 0 q10 0 10 10 m576 0 q0 -10 10 -10 m-586 10 v56 m576 0 v-56 m-576 56 q0 10 10 10 m556 0 q10 0 10 -10 m-566 10 h10 m48 0 h10 m20 0 h10 m100 0 h10 m0 0 h10 m94 0 h10 m-254 0 h20 m234 0 h20 m-274 0 q10 0 10 10 m254 0 q0 -10 10 -10 m-264 10 v24 m254 0 v-24 m-254 24 q0 10 10 10 m234 0 q10 0 10 -10 m-244 10 h10 m92 0 h10 m0 0 h10 m58 0 h10 m0 0 h44 m20 -44 h214 m43 -152 h-3"></path>
<polygon points="735 83 743 79 743 87"></polygon>
<polygon points="735 83 727 79 727 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
