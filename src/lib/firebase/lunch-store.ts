import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  parseConfig,
  parseEmployee,
  parseShop,
  sortEmployees,
  sortShops,
  type LunchData,
} from "@/lib/lunch-data";
import { SEED_CONFIG, SEED_EMPLOYEES, SEED_SHOPS } from "@/lib/seed-data";

// Firestore の構成
//   employees/{id}  : { name, department }
//   shops/{id}      : { name, order }
//   settings/config : { deadline, lunchStart }
//   meta/seed       : { seededAt }  ダミーデータを保存済みの印。ルールはこの印がない間だけ書き込みを許す。

/** Firestore から名簿・お店・時刻の設定を読む。ダミーデータが未保存なら null。 */
async function fetchLunchData(db: Firestore): Promise<LunchData | null> {
  const seeded = await getDoc(doc(db, "meta", "seed"));
  if (!seeded.exists()) return null;

  const [employeesSnap, shopsSnap, configSnap] = await Promise.all([
    getDocs(collection(db, "employees")),
    getDocs(collection(db, "shops")),
    getDoc(doc(db, "settings", "config")),
  ]);
  if (!configSnap.exists()) {
    throw new Error("settings/config がありません");
  }

  return {
    employees: sortEmployees(
      employeesSnap.docs.map((d) => parseEmployee(d.id, d.data())),
    ),
    shops: sortShops(shopsSnap.docs.map((d) => parseShop(d.id, d.data()))),
    config: parseConfig(configSnap.data()),
  };
}

/** ダミーデータを Firestore に保存する。1回のバッチなので、全部入るか全部入らないかのどちらか。 */
async function seedLunchData(db: Firestore): Promise<void> {
  const batch = writeBatch(db);
  for (const e of SEED_EMPLOYEES) {
    batch.set(doc(db, "employees", e.id), {
      name: e.name,
      department: e.department,
    });
  }
  for (const s of SEED_SHOPS) {
    batch.set(doc(db, "shops", s.id), { name: s.name, order: s.order });
  }
  batch.set(doc(db, "settings", "config"), { ...SEED_CONFIG });
  batch.set(doc(db, "meta", "seed"), { seededAt: serverTimestamp() });
  await batch.commit();
}

/**
 * アプリ起動時に呼ぶ。Firestore から読み込む。
 * まだ何も保存されていなければ、先にダミーデータを保存してから読む。
 */
export async function loadLunchData(db: Firestore): Promise<LunchData> {
  const first = await fetchLunchData(db);
  if (first) return first;

  try {
    await seedLunchData(db);
  } catch (e) {
    // ほかの人が同時に保存した場合は、ルールに拒否される。読み直せれば問題ない。
    if ((e as { code?: string }).code !== "permission-denied") throw e;
  }

  const second = await fetchLunchData(db);
  if (!second) throw new Error("Firestore にデータを保存できませんでした");
  return second;
}
