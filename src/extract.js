import { unified } from "unified";
import remarkParse from "remark-parse";
import * as core from "@actions/core";

export function extractPRBodyBlocks(body) {
  const tree = unified().use(remarkParse).parse(body);
  let typeBlock = "";
  let purposeBlock = "";
  let collecting = null;

  for (const node of tree.children) {
    if (node.type === "heading") {
      const h = node.children[0].value.toLowerCase();
      if (h.includes("type of change")) collecting = "type";
      else if (h.includes("purpose")) collecting = "purpose";
      else collecting = null;
      continue;
    }
    if (!collecting) continue;
    const raw = body.slice(node.position.start.offset, node.position.end.offset);
    if (collecting === "type") typeBlock += raw + "\n";
    if (collecting === "purpose") purposeBlock += raw + "\n";
  }

  return { typeBlock: typeBlock.trim(), purposeBlock: purposeBlock.trim() };
}

try {
  const prBody = core.getInput("pr_body");
  
  // --- 加入這行來偵錯 ---
  core.info(`Received PR Body to parse: \n---\n${prBody}\n---`); 
  
  const { typeBlock, purposeBlock } = extractPRBodyBlocks(prBody);

  core.info(`Parsed type_block: ${typeBlock}`); 
  core.info(`Parsed purpose_block: ${purposeBlock}`); 

  core.setOutput("type_block", typeBlock);
  core.setOutput("purpose_block", purposeBlock);

} catch (error) {
  core.setFailed(error.message);
}