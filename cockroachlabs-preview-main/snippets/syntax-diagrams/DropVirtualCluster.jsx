export const DropVirtualCluster = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="831" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">DROP</text>
<rect height="32" rx="10" width="80" x="109" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="107" y="1"></rect>
<text class="terminal" x="117" y="21">VIRTUAL</text>
<rect height="32" rx="10" width="82" x="209" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="207" y="1"></rect>
<text class="terminal" x="217" y="21">CLUSTER</text>
<rect height="32" rx="10" width="34" x="331" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="329" y="33"></rect>
<text class="terminal" x="339" y="53">IF</text>
<rect height="32" rx="10" width="70" x="385" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="383" y="33"></rect>
<text class="terminal" x="393" y="53">EXISTS</text>
<a xlink:title="virtual_cluster_spec" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="148" x="495" y="3"></rect>
<rect class="nonterminal" height="32" width="148" x="493" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="505" y="21">virtual_cluster_spec</text>
</a>
<rect height="32" rx="10" width="100" x="683" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="681" y="33"></rect>
<text class="terminal" x="691" y="53">IMMEDIATE</text>
<path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m82 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m148 0 h10 m20 0 h10 m0 0 h110 m-140 0 h20 m120 0 h20 m-160 0 q10 0 10 10 m140 0 q0 -10 10 -10 m-150 10 v12 m140 0 v-12 m-140 12 q0 10 10 10 m120 0 q10 0 10 -10 m-130 10 h10 m100 0 h10 m23 -32 h-3"></path>
<polygon points="821 17 829 13 829 21"></polygon>
<polygon points="821 17 813 13 813 21"></polygon>
</svg>`,
        }}
      />
    </Frame>
  );
};
