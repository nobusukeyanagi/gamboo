(() => {
  "use strict";

  if (customElements.get("gamboo-category-menu")) return;

  const scriptUrl = document.currentScript?.src || window.location.href;
  const appRoot = new URL("../", scriptUrl);
  const logoUrl = new URL("assets/logo_gamboobet.png", appRoot);
  const homeUrl = new URL("vote/", appRoot);
  const ITEMS = [
    { id: "racecard", label: "出走表", path: "vote/" },
    { id: "odds", label: "オッズ", path: "vote/odds/" },
    { id: "prediction", label: "予想", path: "vote/prediction/" },
    { id: "bet", label: "投票", path: "vote/bet/" },
    { id: "inquiry", label: "照会", path: "vote/introduction/" },
    { id: "results", label: "結果", path: "vote/results/" },
  ];

  class GambooCategoryMenu extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const active = this.getAttribute("active") || ITEMS[0].id;
      const shadow = this.attachShadow({ mode: "open" });
      const links = ITEMS.map((item) => {
        const selected = item.id === active;
        return `<a href="${new URL(item.path, appRoot).href}" class="${selected ? "active" : ""}" ${selected ? 'aria-current="page"' : ""}>${item.label}</a>`;
      }).join("");

      shadow.innerHTML = `
        <style>
          *{box-sizing:border-box}
          :host{display:block;width:100%;height:100%;font-family:"ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro",Verdana,"メイリオ",Meiryo,"ＭＳ Ｐゴシック","MS PGothic",sans-serif;-webkit-text-size-adjust:100%;text-size-adjust:100%}
          .category-bar{width:min(100%,1200px);height:100%;margin:0 auto;display:grid;grid-template-columns:170px minmax(0,1fr);align-items:stretch;padding:0 5px}
          .brand{display:flex;align-items:center;justify-content:center;min-width:0;padding:0 10px 0 5px;-webkit-tap-highlight-color:transparent}
          .brand img{display:block;width:150px;height:35px;object-fit:contain}
          nav{min-width:0;height:100%;display:grid;grid-template-columns:repeat(${ITEMS.length},minmax(0,1fr));align-items:stretch}
          nav a{position:relative;min-width:0;display:flex;align-items:center;justify-content:center;padding:0 5px;color:#5c4514;text-decoration:none;font-size:13px;font-weight:800;line-height:1;letter-spacing:.015em;white-space:nowrap;-webkit-tap-highlight-color:transparent;text-shadow:none}
          nav a::after{content:"";position:absolute;right:26%;bottom:5px;left:26%;height:2px;border-radius:99px;background:linear-gradient(90deg,transparent,#9b7018,transparent);box-shadow:0 0 7px rgba(181,132,25,.30);opacity:0;transform:scaleX(.45);transition:opacity .18s ease,transform .18s ease}
          nav a.active{color:#211706;background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(213,171,67,.14))}
          nav a.active::after{opacity:1;transform:scaleX(1)}
          a:focus-visible{outline:2px solid #8c6415;outline-offset:-2px}
          @media(hover:hover){nav a:hover{color:#8c6415;background:rgba(255,255,255,.34)}.brand:hover{filter:brightness(1.08)}}
          @media(max-width:899px){.category-bar{grid-template-columns:1fr;grid-template-rows:34px 42px;padding:0 2px}.brand{padding:0;border-bottom:1px solid rgba(213,171,67,.34)}.brand img{width:auto;height:34px;max-width:min(160px,46vw)}nav{grid-row:2;grid-template-columns:repeat(${ITEMS.length},minmax(0,1fr));column-gap:0}nav a{font-size:12.5px;padding-inline:0;letter-spacing:0}}
          @media(max-width:350px){.brand img{max-width:145px}nav a{font-size:11px;letter-spacing:-.02em}}
        </style>
        <div class="category-bar">
          <a class="brand" href="${homeUrl.href}" aria-label="GambooBET 出走表へ">
            <img src="${logoUrl.href}" alt="GambooBET">
          </a>
          <nav aria-label="投票ページ選択メニュー">${links}</nav>
        </div>`;

      const nav = shadow.querySelector("nav");
      const stop = (event) => event.preventDefault();
      for (const type of ["gesturestart", "gesturechange", "gestureend"]) {
        nav.addEventListener(type, stop, { passive: false });
      }
      nav.addEventListener("touchmove", (event) => {
        if (event.touches.length > 1) event.preventDefault();
      }, { passive: false });
    }
  }

  customElements.define("gamboo-category-menu", GambooCategoryMenu);
})();
