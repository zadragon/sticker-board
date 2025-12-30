// src/utils/adHelper.ts
export const showRandomAd = (probability = 0.3) => {
  const shouldShow = Math.random() < probability;

  if (shouldShow) {
    try {
      // @ts-expect-error: adsbygoogle은 외부 스크립트에서 주입됨
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "ca-pub-자신의ID",
        enable_page_level_ads: true,
        interstitial: "on",
      });
      console.log("광고 요청됨 🚀");
    } catch (e) {
      console.error("애드센스 로드 실패", e);
    }
  }
};
