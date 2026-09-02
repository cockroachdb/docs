export const ShowTransferStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="191" width="505" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="80" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">DEFAULT</text>
<rect height="32" rx="10" width="82" x="215" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="213" y="1"></rect>
<text class="terminal" x="223" y="21">SESSION</text>
<rect height="32" rx="10" width="98" x="317" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="315" y="1"></rect>
<text class="terminal" x="325" y="21">VARIABLES</text>
<rect height="32" rx="10" width="48" x="435" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="433" y="1"></rect>
<text class="terminal" x="443" y="21">FOR</text><a xlink:href="#role_or_group_or_user" xlink:title="role_or_group_or_user">
<rect height="32" width="168" x="187" y="69"></rect>
<rect class="nonterminal" height="32" width="168" x="185" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="197" y="87">role_or_group_or_user</text></a><a xlink:href="#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="375" y="69"></rect>
<rect class="nonterminal" height="32" width="82" x="373" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="385" y="87">role_spec</text></a><rect height="32" rx="10" width="90" x="207" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="205" y="111"></rect>
<text class="terminal" x="215" y="131">ROLE_ALL</text>
<rect height="32" rx="10" width="90" x="207" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="205" y="155"></rect>
<text class="terminal" x="215" y="175">USER_ALL</text>
<rect height="32" rx="10" width="44" x="337" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="335" y="111"></rect>
<text class="terminal" x="345" y="131">ALL</text>
<path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m98 0 h10 m0 0 h10 m48 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-360 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m168 0 h10 m0 0 h10 m82 0 h10 m-310 0 h20 m290 0 h20 m-330 0 q10 0 10 10 m310 0 q0 -10 10 -10 m-320 10 v24 m310 0 v-24 m-310 24 q0 10 10 10 m290 0 q10 0 10 -10 m-280 10 h10 m90 0 h10 m-130 0 h20 m110 0 h20 m-150 0 q10 0 10 10 m130 0 q0 -10 10 -10 m-140 10 v24 m130 0 v-24 m-130 24 q0 10 10 10 m110 0 q10 0 10 -10 m-120 10 h10 m90 0 h10 m20 -44 h10 m44 0 h10 m0 0 h76 m23 -44 h-3"></path>
<polygon points="495 83 503 79 503 87"></polygon>
<polygon points="495 83 487 79 487 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
