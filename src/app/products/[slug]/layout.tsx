import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/product-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.name;
  const description = `Buy ${product.name} from Electriz. ${
    product.price.savings
      ? `Save £${product.price.savings.toFixed(2)}.`
      : ""
  } Free delivery available on orders over £40.`.trim();
  const image = product.imageLarge || product.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${title} | Electriz`,
      description,
      type: "website",
      ...(image ? { images: [{ url: image, width: 600, height: 600, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Electriz`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
