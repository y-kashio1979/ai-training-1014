// お店の候補(Firestore の shops コレクション)を変更する MCP サーバー。
//
// Admin SDK で書き込むため firestore.rules は通らない(ルールの対象外)。
// 認証には、サービスアカウントの鍵ファイルのパスを環境変数
// GOOGLE_APPLICATION_CREDENTIALS に設定しておく。鍵の中身はここでは読まない。
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import { parseShop, sortShops, type Shop } from "../lib/lunch-data";
import {
  buildShopUpdate,
  nextShopId,
  nextShopOrder,
  normalizeShopName,
  validateShopOrder,
} from "../lib/shop-edit";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "環境変数 GOOGLE_APPLICATION_CREDENTIALS(サービスアカウント鍵ファイルのパス)が未設定です",
  );
  process.exit(1);
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const shopsRef = getFirestore(app).collection("shops");

async function loadShops(): Promise<Shop[]> {
  const snap = await shopsRef.get();
  return sortShops(snap.docs.map((d) => parseShop(d.id, d.data())));
}

function text(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

const server = new McpServer({ name: "lunch-shops", version: "0.1.0" });

server.registerTool(
  "list_shops",
  { description: "お店の候補を並び順(order)で一覧する" },
  async () => {
    try {
      return text(await loadShops());
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "add_shop",
  {
    description:
      "お店の候補を追加する。order を省略すると、今の最後に追加する。",
    inputSchema: {
      name: z.string().describe("お店の名前(50 文字以内)"),
      order: z.number().optional().describe("並び順。小さいほど先に表示する"),
    },
  },
  async ({ name, order }) => {
    try {
      const shops = await loadShops();
      const shop: Shop = {
        id: nextShopId(shops.map((s) => s.id)),
        name: normalizeShopName(name),
        order:
          order === undefined ? nextShopOrder(shops) : validateShopOrder(order),
      };
      await shopsRef.doc(shop.id).create({ name: shop.name, order: shop.order });
      return text(shop);
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "update_shop",
  {
    description: "お店の名前か並び順を変える。指定した項目だけ変わる。",
    inputSchema: {
      id: z.string().describe("お店の ID(list_shops で確認できる)"),
      name: z.string().optional().describe("新しい名前"),
      order: z.number().optional().describe("新しい並び順"),
    },
  },
  async ({ id, name, order }) => {
    try {
      const update = buildShopUpdate({ name, order });
      const ref = shopsRef.doc(id);
      if (!(await ref.get()).exists) {
        throw new Error(`shops/${id} はありません`);
      }
      await ref.update(update);
      return text(parseShop(id, (await ref.get()).data() ?? {}));
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "delete_shop",
  {
    description:
      "お店の候補を削除する。取り消せないので、confirm に true を渡したときだけ実行する。",
    inputSchema: {
      id: z.string().describe("お店の ID"),
      confirm: z.boolean().describe("削除してよいと確認できたら true"),
    },
  },
  async ({ id, confirm }) => {
    try {
      if (confirm !== true) {
        throw new Error("削除するには confirm に true を指定してください");
      }
      const ref = shopsRef.doc(id);
      const snap = await ref.get();
      if (!snap.exists) {
        throw new Error(`shops/${id} はありません`);
      }
      const deleted = parseShop(id, snap.data() ?? {});
      await ref.delete();
      return text({ deleted });
    } catch (error) {
      return failure(error);
    }
  },
);

server.connect(new StdioServerTransport()).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
