(function() {
  // Capture the current script tag immediately before DOM loads
  const currentScript = document.currentScript;

  function initWidget() {
    try {
      // 1. Find the script tag and widget container
      const scriptTag = currentScript || document.querySelector('script[src*="widget.js"]');
      const widgetContainer = document.getElementById('encyclo-widget');

      if (!scriptTag || !widgetContainer) {
        return;
      }

      const apiKey = scriptTag.getAttribute('data-key');
      if (!apiKey) {
        widgetContainer.style.display = 'none';
        return;
      }

      // Infer base URL from script src for local dev support, fallback to production URL
      let baseUrl = 'https://encyclo.az';
      if (scriptTag.src) {
        try {
          const urlObj = new URL(scriptTag.src);
          baseUrl = urlObj.origin;
        } catch (e) {
          // ignore error
        }
      }

      // 2. Fetch data
      const apiUrl = `${baseUrl}/api/widget/smart?key=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(document.title)}`;

      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error('API Error');
          return res.json();
        })
        .then(data => {
          // 3. Render widget or fail silently if no products
          if (!data || !data.products || data.products.length === 0) {
            widgetContainer.style.display = 'none';
            return;
          }

          renderWidget(widgetContainer, data.products, baseUrl);
        })
        .catch(() => {
          // 6. Silent fail on network error
          widgetContainer.style.display = 'none';
        });

    } catch (e) {
      // 6. Never throw in production, silent fail
      const container = document.getElementById('encyclo-widget');
      if (container) {
        container.style.display = 'none';
      }
    }
  }

  function renderWidget(container, products, baseUrl) {
    // 5. Inject styles
    injectStyles();

    // 4. Render HTML
    const titleHtml = '<div class="encyclo-widget-header">Əlaqəli məhsullar</div>';
    
    let cardsHtml = '';
    products.forEach(p => {
      // Fallback style if no image is available
      const imageStyle = p.image 
        ? `background-image: url('${p.image}')` 
        : `background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`;
      
      cardsHtml += `
        <a class="encyclo-widget-card" href="${p.url}" target="_blank" rel="noopener noreferrer">
          <div class="encyclo-widget-card-img" style="${imageStyle}"></div>
          <div class="encyclo-widget-card-content">
            <div class="encyclo-widget-card-title">${escapeHtml(p.name)}</div>
            <div class="encyclo-widget-card-company">${escapeHtml(p.company_name)}</div>
          </div>
        </a>
      `;
    });

    const bodyHtml = `<div class="encyclo-widget-cards-container">${cardsHtml}</div>`;
    
    const footerHtml = `
      <div class="encyclo-widget-footer">
        Powered by <a href="${baseUrl}" target="_blank" rel="noopener noreferrer">Encyclo</a>
      </div>
    `;

    container.innerHTML = `
      <div class="encyclo-widget-wrapper">
        ${titleHtml}
        ${bodyHtml}
        ${footerHtml}
      </div>
    `;
    container.style.display = 'block'; // Make visible if it was hidden
  }

  function injectStyles() {
    if (document.getElementById('encyclo-widget-styles')) return;

    const style = document.createElement('style');
    style.id = 'encyclo-widget-styles';
    style.innerHTML = `
      .encyclo-widget-wrapper {
        font-family: inherit;
        box-sizing: border-box;
        margin: 24px 0;
        width: 100%;
        background: transparent;
      }
      .encyclo-widget-wrapper * {
        box-sizing: border-box;
      }
      .encyclo-widget-header {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 16px;
        color: inherit;
        opacity: 0.9;
      }
      .encyclo-widget-cards-container {
        display: flex;
        overflow-x: auto;
        gap: 16px;
        padding-bottom: 12px;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db transparent;
      }
      .encyclo-widget-cards-container::-webkit-scrollbar {
        height: 6px;
      }
      .encyclo-widget-cards-container::-webkit-scrollbar-track {
        background: transparent;
      }
      .encyclo-widget-cards-container::-webkit-scrollbar-thumb {
        background-color: #d1d5db;
        border-radius: 4px;
      }
      .encyclo-widget-card {
        flex: 0 0 auto;
        width: 220px;
        display: flex;
        flex-direction: column;
        text-decoration: none;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .encyclo-widget-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      .encyclo-widget-card-img {
        width: 100%;
        height: 140px;
        background-color: #f3f4f6;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-bottom: 1px solid #f3f4f6;
      }
      .encyclo-widget-card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .encyclo-widget-card-title {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 6px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .encyclo-widget-card-company {
        font-size: 13px;
        color: #6b7280;
        margin-top: auto;
        font-weight: 500;
      }
      .encyclo-widget-footer {
        text-align: right;
        font-size: 12px;
        color: #9ca3af;
        margin-top: 12px;
        padding-right: 4px;
      }
      .encyclo-widget-footer a {
        color: #9ca3af;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.15s;
      }
      .encyclo-widget-footer a:hover {
        color: #4b5563;
      }
      @media (max-width: 640px) {
        .encyclo-widget-card {
          width: 180px;
        }
        .encyclo-widget-card-img {
          height: 120px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  // 1. Initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
