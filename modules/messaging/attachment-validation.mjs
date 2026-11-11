export const MAX_FILES = 5;
export const MAX_BYTES = 3 * 1024 * 1024;
export const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt";
const mimeByExtension = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", txt: "text/plain",
};

// Inspect the ZIP central directory without decompressing attacker-controlled entries.
function isDocx(bytes) {
  if (bytes.length < 22 || bytes.readUInt32LE(0) !== 0x04034b50) return false;
  const minimum = Math.max(0, bytes.length - 65557);
  for (let e = bytes.length - 22; e >= minimum; e--) {
    if (bytes.readUInt32LE(e) !== 0x06054b50 || e + 22 + bytes.readUInt16LE(e + 20) !== bytes.length) continue;
    const count = bytes.readUInt16LE(e + 10);
    let offset = bytes.readUInt32LE(e + 16);
    if (!count || count > 1000 || bytes.readUInt16LE(e + 4) || bytes.readUInt16LE(e + 6) ||
        bytes.readUInt16LE(e + 8) !== count || offset + bytes.readUInt32LE(e + 12) !== e) return false;
    const names = new Set();
    let expanded = 0;
    for (let i = 0; i < count; i++) {
      if (offset + 46 > e || bytes.readUInt32LE(offset) !== 0x02014b50 || bytes.readUInt16LE(offset + 8) & 1) return false;
      const length = bytes.readUInt16LE(offset + 28);
      const end = offset + 46 + length;
      if (!length || end > e) return false;
      const name = bytes.toString("utf8", offset + 46, end);
      if (/^(\/|\\)|\\|(^|\/)\.\.(\/|$)|vbaProject\.bin|^word\/embeddings\//i.test(name)) return false;
      expanded += bytes.readUInt32LE(offset + 24);
      if (expanded > 50 * 1024 * 1024) return false;
      const local = bytes.readUInt32LE(offset + 42);
      if (local + 30 > e || bytes.readUInt32LE(local) !== 0x04034b50 || bytes.readUInt16LE(local + 26) !== length ||
          bytes.toString("utf8", local + 30, local + 30 + length) !== name ||
          local + 30 + length + bytes.readUInt16LE(local + 28) + bytes.readUInt32LE(offset + 20) > e) return false;
      names.add(name);
      offset = end + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
    }
    return offset === e && names.has("[Content_Types].xml") && names.has("word/document.xml");
  }
  return false;
}

export function identifyAttachment(name, bytes, declaredType = "") {
  const extension = name.split(".").at(-1)?.toLowerCase();
  const type = Object.hasOwn(mimeByExtension, extension) ? mimeByExtension[extension] : null;
  if (!type || !bytes.length || bytes.length > MAX_BYTES ||
      (declaredType && declaredType !== "application/octet-stream" && declaredType !== type)) return null;
  if (type === "image/jpeg") return bytes.length >= 5 && bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) && bytes.readUInt16BE(bytes.length - 2) === 0xffd9 ? type : null;
  if (type === "image/png") return bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString("ascii", 12, 16) === "IHDR" ? type : null;
  if (type === "image/webp") return bytes.length >= 20 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" && bytes.readUInt32LE(4) + 8 === bytes.length && ["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16)) ? type : null;
  if (type === "application/pdf") return /^%PDF-\d\.\d/.test(bytes.toString("ascii", 0, 8)) && /%%EOF\s*$/.test(bytes.toString("latin1", Math.max(0, bytes.length - 1024))) ? type : null;
  if (extension === "docx") return isDocx(bytes) ? type : null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return text && !Array.from(text).some((char) => (char.charCodeAt(0) < 32 && !"\n\r\t".includes(char)) || char.charCodeAt(0) === 127) ? type : null;
  } catch { return null; }
}

