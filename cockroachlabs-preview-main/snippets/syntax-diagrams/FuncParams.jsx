export const FuncParams = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="319" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="26" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">(</text><a xlink:href="#func_params_list" xlink:title="func_params_list">
<rect height="32" width="128" x="97" y="35"></rect>
<rect class="nonterminal" height="32" width="128" x="95" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="107" y="53">func_params_list</text></a><rect height="32" rx="10" width="26" x="265" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="263" y="1"></rect>
<text class="terminal" x="273" y="21">)</text>
<path class="line" d="m17 17 h2 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h138 m-168 0 h20 m148 0 h20 m-188 0 q10 0 10 10 m168 0 q0 -10 10 -10 m-178 10 v12 m168 0 v-12 m-168 12 q0 10 10 10 m148 0 q10 0 10 -10 m-158 10 h10 m128 0 h10 m20 -32 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="309 17 317 13 317 21"></polygon>
<polygon points="309 17 301 13 301 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
