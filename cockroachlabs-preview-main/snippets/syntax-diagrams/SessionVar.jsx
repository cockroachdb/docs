export const SessionVar = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="465" width="379" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">identifier</text><a xlink:href="#session_var_parts" xlink:title="session_var_parts">
<rect height="32" width="138" x="173" y="35"></rect>
<rect class="nonterminal" height="32" width="138" x="171" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="10" class="nonterminal" x="183" y="53">session_var_parts</text></a><rect height="32" rx="10" width="44" x="51" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="49" y="77"></rect>
<text class="terminal" x="59" y="97">ALL</text>
<rect height="32" rx="10" width="92" x="51" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="49" y="121"></rect>
<text class="terminal" x="59" y="141">DATABASE</text>
<rect height="32" rx="10" width="68" x="51" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="68" x="49" y="165"></rect>
<text class="terminal" x="59" y="185">NAMES</text>
<rect height="32" rx="10" width="56" x="51" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="49" y="209"></rect>
<text class="terminal" x="59" y="229">ROLE</text>
<rect height="32" rx="10" width="128" x="51" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="128" x="49" y="253"></rect>
<text class="terminal" x="59" y="273">SESSION_USER</text>
<rect height="32" rx="10" width="108" x="51" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="108" x="49" y="297"></rect>
<text class="terminal" x="59" y="317">LC_COLLATE</text>
<rect height="32" rx="10" width="88" x="51" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="49" y="341"></rect>
<text class="terminal" x="59" y="361">LC_CTYPE</text>
<rect height="32" rx="10" width="54" x="51" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="49" y="385"></rect>
<text class="terminal" x="59" y="405">TIME</text>
<rect height="32" rx="10" width="58" x="125" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="123" y="385"></rect>
<text class="terminal" x="133" y="405">ZONE</text>
<rect height="32" rx="10" width="198" x="51" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="198" x="49" y="429"></rect>
<text class="terminal" x="59" y="449">VIRTUAL_CLUSTER_NAME</text>
<path class="line" d="m17 17 h2 m20 0 h10 m82 0 h10 m20 0 h10 m0 0 h148 m-178 0 h20 m158 0 h20 m-198 0 q10 0 10 10 m178 0 q0 -10 10 -10 m-188 10 v12 m178 0 v-12 m-178 12 q0 10 10 10 m158 0 q10 0 10 -10 m-168 10 h10 m138 0 h10 m-300 -32 h20 m300 0 h20 m-340 0 q10 0 10 10 m320 0 q0 -10 10 -10 m-330 10 v56 m320 0 v-56 m-320 56 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m44 0 h10 m0 0 h236 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m92 0 h10 m0 0 h188 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m68 0 h10 m0 0 h212 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m56 0 h10 m0 0 h224 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m128 0 h10 m0 0 h152 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m108 0 h10 m0 0 h172 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m88 0 h10 m0 0 h192 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m54 0 h10 m0 0 h10 m58 0 h10 m0 0 h148 m-310 -10 v20 m320 0 v-20 m-320 20 v24 m320 0 v-24 m-320 24 q0 10 10 10 m300 0 q10 0 10 -10 m-310 10 h10 m198 0 h10 m0 0 h82 m23 -428 h-3"></path>
<polygon points="369 17 377 13 377 21"></polygon>
<polygon points="369 17 361 13 361 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
