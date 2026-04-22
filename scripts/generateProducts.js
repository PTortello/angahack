// node scripts/generateProducts.js


import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL =
  "https://www.asmodee.com.br/ccstoreui/v1/search?N=739621993&Nr=NOT(product.x_productView%3Aagente)&Nrpp=12&pageSize=250&searchType=guided&type=search&page=";

const STOCK_URL =
  "https://www.asmodee.com.br/ccstoreui/v1/stockStatus/%7B%7D?skuId=";

const CONCURRENCY = 10;

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));

        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", reject);
  });
}

function extractProducts(data) {
  return data.resultsList.records.flatMap((group) =>
    (group.records ?? []).map((record) => {
      const attrs = record.attributes;

      return {
        displayName: attrs["sku.displayName"]?.[0] ?? "",
        skuId: attrs["sku.repositoryId"]?.[0] ?? "",
      };
    })
  );
}

async function getAllProducts() {
  let page = 1;
  const all = [];

  while (true) {
    const data = await get(`${BASE_URL}${page}`);
    const products = extractProducts(data);

    if (!products.length) break;

    all.push(...products);

    if (products.length < 250) break;

    page++;
  }

  return all;
}

async function getStock(skuId) {
  try {
    const data = await get(`${STOCK_URL}${skuId}`);

    if (data.stockStatus === "IN_STOCK") {
      return data.inStockQuantity ?? 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

async function mapWithLimit(items, limit, asyncFn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      results[currentIndex] = await asyncFn(item);
    }
  }

  const workers = Array.from({ length: limit }, worker);
  await Promise.all(workers);

  return results;
}

(async () => {
  const baseProducts = await getAllProducts();
  const filtered = baseProducts.filter((p) => p.skuId);

  const start = Date.now();
  let done = 0;

  const result = await mapWithLimit(filtered, CONCURRENCY, async (p) => {
    const quantity = await getStock(p.skuId);

    done++;
    if (done % 50 === 0) {
      console.log(`${done}/${filtered.length}`);
    }

    return {
      displayName: p.displayName,
      displayNameLower: p.displayName.toLowerCase(),
      quantity,
    };
  });

  console.log(`finished in ${(Date.now() - start) / 1000}s`);

  const outputDir = path.resolve(__dirname, "../src/data");
  const outputPath = path.join(outputDir, "products.ts");

  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    outputPath,
    `export const products = ${JSON.stringify(result, null, 2)};`
  );
})();
