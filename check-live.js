const tools = [
  'base64-encoder','case-converter','checksum-calculator','color-converter',
  'curl-to-python-requests-converter','hash-generator','hmac-generator',
  'html-encoder-decoder','http-header-inspector--parser','image-resizer',
  'json-formatter','json-to-go-struct-generator','json-to-pydantic-&-python-dataclass-generator',
  'json-to-typescript-interface-generator','json-yaml-converter','jwt-decoder-&-inspector',
  'lorem-ipsum','password-generator','qr-code-generator','regex-tester',
  'secure-password-generator','text-diff-checker','unix-timestamp-converter',
  'url-encoder-decoder','user-agent','user-agent-parser','uuid-generator'
];

async function checkAll() {
  console.log('🔍 Testing all tools via localhost...\n');
  let broken = [], working = [];
  
  for (const tool of tools) {
    try {
      const res = await fetch(`http://localhost:3000/tools/${tool}`);
      if (res.status === 200) {
        working.push(tool);
        console.log(`✅ OK: ${tool}`);
      } else {
        broken.push(tool);
        console.log(`❌ BROKEN (${res.status}): ${tool}`);
      }
    } catch (e) {
      broken.push(tool);
      console.log(`❌ ERROR: ${tool}`);
    }
  }
  console.log(`\n--- SUMMARY ---`);
  console.log(`✅ Working: ${working.length}`);
  console.log(`❌ Broken: ${broken.length}`);
  console.log(`\nBroken tools list:\n${broken.join('\n')}`);
}
checkAll();