/**
 * 安全序列化 JSON-LD 資料。
 * 轉義 `<` 與 Unicode 行分隔符，避免資料含 `</script>` 時提前閉合標籤造成 XSS。
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
