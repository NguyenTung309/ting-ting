import { permanentRedirect } from "next/navigation";

export default function CardOnlineRedirect(): never {
  permanentRedirect("/card");
}
