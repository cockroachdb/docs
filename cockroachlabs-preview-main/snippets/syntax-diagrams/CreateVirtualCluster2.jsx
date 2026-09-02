export const CreateVirtualCluster2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="155" width="799" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">CREATE</text>
<rect height="32" rx="10" width="80" x="125" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="123" y="1"></rect>
<text class="terminal" x="133" y="21">VIRTUAL</text>
<rect height="32" rx="10" width="82" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">CLUSTER</text>
<rect height="32" rx="10" width="34" x="347" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="345" y="33"></rect>
<text class="terminal" x="355" y="53">IF</text>
<rect height="32" rx="10" width="48" x="401" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="399" y="33"></rect>
<text class="terminal" x="409" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="469" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="467" y="33"></rect>
<text class="terminal" x="477" y="53">EXISTS</text>
<a xlink:title="virtual_cluster_name" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="154" x="579" y="3"></rect>
<rect class="nonterminal" height="32" width="154" x="577" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="10" class="nonterminal" x="589" y="21">virtual_cluster_name</text>
</a>
<rect height="32" rx="10" width="60" x="45" y="121"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="43" y="119"></rect>
<text class="terminal" x="53" y="139">FROM</text>
<rect height="32" rx="10" width="114" x="125" y="121"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="123" y="119"></rect>
<text class="terminal" x="133" y="139">REPLICATION</text>
<rect height="32" rx="10" width="38" x="259" y="121"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="257" y="119"></rect>
<text class="terminal" x="267" y="139">OF</text>
<a xlink:title="primary_virtual_cluster" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="166" x="317" y="121"></rect>
<rect class="nonterminal" height="32" width="166" x="315" y="119"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="327" y="139">primary_virtual_cluster</text>
</a>
<rect height="32" rx="10" width="40" x="503" y="121"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="501" y="119"></rect>
<text class="terminal" x="511" y="139">ON</text>
<a xlink:title="primary_connection_string" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="188" x="563" y="121"></rect>
<rect class="nonterminal" height="32" width="188" x="561" y="119"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="164" font-size="10" class="nonterminal" x="573" y="139">primary_connection_string</text>
</a>
<path class="line" d="m19 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m82 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m154 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-752 86 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h716 m-746 0 h20 m726 0 h20 m-766 0 q10 0 10 10 m746 0 q0 -10 10 -10 m-756 10 v12 m746 0 v-12 m-746 12 q0 10 10 10 m726 0 q10 0 10 -10 m-736 10 h10 m60 0 h10 m0 0 h10 m114 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m166 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m188 0 h10 m23 -32 h-3"></path>
<polygon points="789 103 797 99 797 107"></polygon>
<polygon points="789 103 781 99 781 107"></polygon>
</svg>`,
        }}
      />
    </Frame>
  );
};
