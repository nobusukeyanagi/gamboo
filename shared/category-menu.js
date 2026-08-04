(() => {
  "use strict";

  if (customElements.get("gamboo-category-menu")) return;

  const scriptUrl = document.currentScript?.src || window.location.href;
  const appRoot = new URL("../", scriptUrl);
  const ITEMS = [
    { id: "racecard", label: "出走表", path: "vote/" },
    { id: "prediction", label: "予想", path: "vote/prediction/" },
    { id: "odds", label: "オッズ", path: "vote/odds/" },
    { id: "bet", label: "投票入力", path: "vote/bet/" },
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
          nav{width:min(100%,1200px);height:100%;margin:0 auto;display:grid;grid-template-columns:repeat(${ITEMS.length},minmax(0,1fr));align-items:stretch;padding:0 5px}
          a{position:relative;min-width:0;display:flex;align-items:center;justify-content:center;padding:0 5px;color:#5c4514;text-decoration:none;font-size:13px;font-weight:800;line-height:1;letter-spacing:.015em;white-space:nowrap;-webkit-tap-highlight-color:transparent;text-shadow:none}
          a::after{content:"";position:absolute;right:26%;bottom:5px;left:26%;height:2px;border-radius:99px;background:linear-gradient(90deg,transparent,#9b7018,transparent);box-shadow:0 0 7px rgba(181,132,25,.30);opacity:0;transform:scaleX(.45);transition:opacity .18s ease,transform .18s ease}
          a.active{color:#211706;background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(213,171,67,.14))}
          a.active::after{opacity:1;transform:scaleX(1)}
          @media(hover:hover){a:hover{color:#8c6415;background:rgba(255,255,255,.34)}}
          @media(max-width:430px){a{font-size:12px;padding-inline:2px}nav{padding-inline:2px}}
          @media(max-width:350px){a{font-size:10.5px;letter-spacing:-.02em}}
        </style>
        <nav aria-label="投票ページ選択メニュー">${links}</nav>`;

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
