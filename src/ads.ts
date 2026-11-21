// Google Ads (account: Food & Snow Paradise, 837-914-9276) — shared tag for the three snacks sites.
export const ADS_ID = "AW-18298465750";
const LABELS = { quote: "vOeQCPri7bwdENbbsZVE", signup: "RgUzCIvl7bwdENbbsZVE" };

/** First thing in <head>: the Google tag. Conversions fire from public/app.js via window.__ADS. */
export const adsHead = () =>
  `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ADS_ID}');` +
  `window.__ADS={id:'${ADS_ID}',quote:'${LABELS.quote}',signup:'${LABELS.signup}'};</script>` +
  `<script async src="https://www.googletagmanager.com/gtag/js?id=${ADS_ID}"></script>`;
