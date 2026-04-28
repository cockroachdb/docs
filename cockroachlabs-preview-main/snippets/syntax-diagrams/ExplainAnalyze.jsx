export const ExplainAnalyze = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="317" width="747" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon>
<rect height="32" rx="10" width="80" x="31" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="29" y="45"></rect>
<text class="terminal" x="39" y="65">EXPLAIN</text>
<rect height="32" rx="10" width="82" x="151" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="149" y="77"></rect>
<text class="terminal" x="159" y="97">ANALYZE</text>
<rect height="32" rx="10" width="82" x="151" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="149" y="121"></rect>
<text class="terminal" x="159" y="141">ANALYSE</text>
<rect height="32" rx="10" width="26" x="293" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="291" y="45"></rect>
<text class="terminal" x="301" y="65">(</text>
<rect height="32" rx="10" width="56" x="379" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="377" y="45"></rect>
<text class="terminal" x="387" y="65">PLAN</text>
<rect height="32" rx="10" width="84" x="379" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="377" y="89"></rect>
<text class="terminal" x="387" y="109">VERBOSE</text>
<rect height="32" rx="10" width="62" x="379" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="377" y="133"></rect>
<text class="terminal" x="387" y="153">TYPES</text>
<rect height="32" rx="10" width="66" x="379" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="377" y="177"></rect>
<text class="terminal" x="387" y="197">DEBUG</text>
<rect height="32" rx="10" width="74" x="379" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="377" y="221"></rect>
<text class="terminal" x="387" y="241">REDACT</text>
<rect height="32" rx="10" width="82" x="379" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="377" y="265"></rect>
<text class="terminal" x="387" y="285">DISTSQL</text>
<rect height="32" rx="10" width="24" x="359" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="357" y="1"></rect>
<text class="terminal" x="367" y="21">,</text>
<rect height="32" rx="10" width="26" x="523" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="521" y="45"></rect>
<text class="terminal" x="531" y="65">)</text><a xlink:href="/docs/stable/sql-grammar#explainable_stmt" xlink:title="explainable_stmt">
<rect height="32" width="130" x="589" y="47"></rect>
<rect class="nonterminal" height="32" width="130" x="587" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="599" y="65">explainable_stmt</text></a><path class="line" d="m17 61 h2 m0 0 h10 m80 0 h10 m20 0 h10 m0 0 h92 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v12 m122 0 v-12 m-122 12 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m-112 -10 v20 m122 0 v-20 m-122 20 v24 m122 0 v-24 m-122 24 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m40 -76 h10 m26 0 h10 m40 0 h10 m56 0 h10 m0 0 h28 m-124 0 h20 m104 0 h20 m-144 0 q10 0 10 10 m124 0 q0 -10 10 -10 m-134 10 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m84 0 h10 m-114 -10 v20 m124 0 v-20 m-124 20 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m62 0 h10 m0 0 h22 m-114 -10 v20 m124 0 v-20 m-124 20 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m66 0 h10 m0 0 h18 m-114 -10 v20 m124 0 v-20 m-124 20 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m74 0 h10 m0 0 h10 m-114 -10 v20 m124 0 v-20 m-124 20 v24 m124 0 v-24 m-124 24 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m82 0 h10 m0 0 h2 m-144 -220 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m20 44 h10 m26 0 h10 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v234 m296 0 v-234 m-296 234 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m0 0 h266 m20 -254 h10 m130 0 h10 m3 0 h-3"></path>
<polygon points="737 61 745 57 745 65"></polygon>
<polygon points="737 61 729 57 729 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
