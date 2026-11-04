export type Employee = { id: string; name: string; department: string };

/** 名簿を名前で絞り込む。空白の有無は無視する。空の検索語なら全員を返す。 */
export function filterEmployees(
  employees: readonly Employee[],
  query: string,
): Employee[] {
  const keyword = removeSpaces(query);
  return employees.filter((e) => removeSpaces(e.name).includes(keyword));
}

function removeSpaces(text: string): string {
  return text.replace(/[\s　]/g, "");
}
