import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, ExternalLink, Flame } from "lucide-react";
import { trackAffiliateLinkClick } from "@/lib/analytics";

export type Product = {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  affiliate_url: string;
  original_price: number | null;
  sale_price: number | null;
  discount_percent: number | null;
  rating: number | null;
  review_count: number | null;
  is_hot: boolean | null;
  tags: string[];
};

const priceFormatter = new Intl.NumberFormat("ko-KR");

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return (
    <div className="star-rating text-xs">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-gray-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card group">
      {/* 이미지 영역 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* 배지 */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.is_hot && (
            <span className="badge-hot inline-flex items-center gap-1"><Flame className="h-3 w-3" /> HOT</span>
          )}
          {product.discount_percent && product.discount_percent > 0 && (
            <span className="badge-discount">-{product.discount_percent}%</span>
          )}
        </div>

        {/* 카테고리 */}
        {product.category && (
          <span className="absolute bottom-3 right-3 rounded-full border border-gray-200 bg-white/90 px-2 py-0.5 text-[10px] text-gray-600 backdrop-blur-sm shadow-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* 별점 + 리뷰 수 */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400">
              {product.rating.toFixed(1)}
              {product.review_count ? ` (${priceFormatter.format(product.review_count)}개)` : ""}
            </span>
          </div>
        )}

        {/* 가격 */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.sale_price ? (
              <>
                <span className="price-sale text-base">
                  {priceFormatter.format(product.sale_price)}원
                </span>
                {product.original_price && product.original_price !== product.sale_price && (
                  <span className="price-origin">
                    {priceFormatter.format(product.original_price)}원
                  </span>
                )}
              </>
            ) : product.original_price ? (
              <span className="price-sale text-base">
                {priceFormatter.format(product.original_price)}원
              </span>
            ) : null}
          </div>

          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black shadow-sm shadow-amber-500/20 transition hover:bg-amber-400 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              trackAffiliateLinkClick({
                productName: product.name,
                productPrice: product.sale_price ?? product.original_price ?? undefined,
                category: product.category ?? undefined,
              });
            }}
          >
            <ExternalLink className="h-3 w-3" />
            쿠팡에서 보기
          </a>
        </div>
      </div>
    </div>
  );
}
