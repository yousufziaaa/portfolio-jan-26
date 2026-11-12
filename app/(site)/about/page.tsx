import About from "@/components/about/About";
import { photos } from "@/data/about";
import { preview } from "@/lib/placeholders";

export const metadata = { title: "About" };

export default function Page() {
  // Previews are looked up here, on the server, so the client bundle only
  // carries the few it needs.
  return <About previews={photos.map((p) => preview(p.src))} />;
}
