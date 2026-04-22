const https = require('https');
const fs = require('fs');

const BASE_URL =
  'https://www.asmodee.com.br/ccstoreui/v1/search?N=739621993&Nr=NOT(product.x_productView%3Aagente)&Nrpp=12&pageSize=250&searchType=guided&type=search&page=';

const headers = {
  accept: 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
  'cache-control': 'no-cache',
  'content-type': 'application/json',
  pragma: 'no-cache',
  priority: 'u=1, i',
  referer: 'https://www.asmodee.com.br/todos-os-produtos/categoria/B2C-Catalogo-Completo/1',
  'sec-ch-ua': '"Chromium";v="147", "Not.A/Brand";v="8"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
  'x-cc-meteringmode': 'CC-NonMetered',
  'x-ccprofiletype': 'storefrontUI',
  'x-ccsite': 'siteUS',
  'x-ccviewport': 'xs',
  'x-requested-with': 'XMLHttpRequest',
};

function extractProducts(data) {
  return data.resultsList.records.flatMap((group) =>
    (group.records ?? []).map((record) => {
      const attrs = record.attributes;
      const displayName = attrs['sku.displayName']?.[0] ?? null;
      const route = attrs['product.route']?.[0] ?? null;
      const stockAvailability = attrs['sku.availabilityStatus']?.[0] ?? null;
      const skuId = attrs['sku.repositoryId']?.[0] ?? null;
      return {
        displayName,
        url: route ? `https://www.asmodee.com.br${route}` : null,
        stockAvailability,
        skuId
      };
    })
  );
}

function get(targetUrl) {
  return new Promise((resolve, reject) => {
    const req = https.get(targetUrl, { headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
  });
}

(async () => {
  const allProducts = [];
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const data = await get(`${BASE_URL}${page}`);
    const products = extractProducts(data);
    if (products.length === 0) break;
    allProducts.push(...products);
    console.log(`  Got ${products.length} products (total: ${allProducts.length})`);
    if (products.length < 250) break;
    page++;
  }

  fs.writeFileSync('./products.json', JSON.stringify(allProducts, null, 2), 'utf-8');
  console.log(`Saved ${allProducts.length} products to products.json`);
})();
