import { ImageResponse } from "next/og";
import { logoMarkDataUri } from "@/lib/brand/logo-mark-svg";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <img src={logoMarkDataUri()} width={32} height={32} alt="" />
    ),
    { ...size },
  );
}
