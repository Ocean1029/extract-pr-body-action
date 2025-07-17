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

const prBody = process.env.PR_BODY ?? "";
const { typeBlock, purposeBlock } = extractPRBodyBlocks(prBody);
core.setOutput("type_block", typeBlock);
core.setOutput("purpose_block", purposeBlock);
