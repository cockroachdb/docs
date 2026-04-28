export const InlineImage = ({ src, alt = "", height = "1.6em" }) => {
  return (
    <img
      noZoom
      src={src}
      alt={alt}
      style={{
        display: "inline",
        verticalAlign: "start",
        height: height,
        margin: "0",
      }}
    />
  );
};
