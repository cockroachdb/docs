export const CheckExternalConnection = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="123" width="491" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CHECK</text>
<rect height="32" rx="10" width="90" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">EXTERNAL</text>
<rect height="32" rx="10" width="112" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">CONNECTION</text>
<rect height="32" width="112" x="357" y="3"></rect>
<rect class="nonterminal" height="32" width="112" x="355" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="10" class="nonterminal" x="367" y="21">connection_uri</text><rect height="32" rx="10" width="58" x="91" y="89"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="89" y="87"></rect>
<text class="terminal" x="99" y="107">WITH</text><a xlink:href="/docs/stable/sql-grammar#check_external_connection_options_list" xlink:title="check_external_connection_options_list">
<rect height="32" width="274" x="169" y="89"></rect>
<rect class="nonterminal" height="32" width="274" x="167" y="87"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="250" font-size="10" class="nonterminal" x="179" y="107">check_external_connection_options_list</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m112 0 h10 m0 0 h10 m112 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-442 54 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h362 m-392 0 h20 m372 0 h20 m-412 0 q10 0 10 10 m392 0 q0 -10 10 -10 m-402 10 v12 m392 0 v-12 m-392 12 q0 10 10 10 m372 0 q10 0 10 -10 m-382 10 h10 m58 0 h10 m0 0 h10 m274 0 h10 m23 -32 h-3"></path>
<polygon points="481 71 489 67 489 75"></polygon>
<polygon points="481 71 473 67 473 75"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
