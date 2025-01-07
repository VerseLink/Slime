const targetSites = ["https://example.com", "https://game.maj-soul.com/1/"];

const currentUrl = window.location.href;
if(targetSites.some(site => currentUrl.includes(site))){
    if (!document.getElementById("customPopup")) {
        // 創建浮動視窗
        const popup = document.createElement("div");
        popup.id = "customPopup";
        popup.style.position = "fixed";
        popup.style.bottom = "10px";
        popup.style.right = "10px";
        popup.style.width = "300px";
        popup.style.height = "200px";
        popup.style.backgroundColor = "green";
        popup.style.border = "1px solid #ccc";
        popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        popup.style.borderRadius = "8px";
        popup.style.zIndex = "10000";
        popup.style.padding = "15px";
        popup.style.fontFamily = "Arial, sans-serif";
        popup.style.fontSize = "14px";
        popup.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 16px;">浮動提示</h3>
            <p>偵測到指定網站，這是自定義的浮動視窗。</p>
            <button id="closePopup" style="background-color: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">關閉</button>
        `;
        document.body.appendChild(popup);
        document.getElementById("closePopup")?.addEventListener("click", () => {
            popup.remove();
        });
    }
}
