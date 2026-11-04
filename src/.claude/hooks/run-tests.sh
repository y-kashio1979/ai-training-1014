#!/usr/bin/env bash
# Stop フック: 回答の最後に npm run test を実行する。
# 失敗したら decision:block で Claude に修正を依頼する。
# 修正後の再実行(stop_hook_active=true)でも失敗した場合は、これ以上続けず終了する。

input="$(cat)"
active="$(printf '%s' "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).stop_hook_active===true)}catch{console.log(false)}})')"

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# vitest をウォッチモードにしないため --run を付ける
output="$(npm run test -- --run 2>&1)"
status=$?

if [ "$status" -eq 0 ]; then
  exit 0
fi

if [ "$active" = "true" ]; then
  # 1回修正しても通らなかったので、自動では続けない
  printf '{"systemMessage":"修正後もテストが通りませんでした。自動修正を終了します。"}\n'
  exit 0
fi

# 出力が長い場合は末尾だけ渡す
tail_output="$(printf '%s' "$output" | tail -n 60)"
REASON="npm run test が失敗しました。次の結果をもとに原因を調べて修正してください(修正は1回だけです。テストファイルは変更しないでください)。

${tail_output}" node -e 'console.log(JSON.stringify({decision:"block",reason:process.env.REASON}))'
exit 0
