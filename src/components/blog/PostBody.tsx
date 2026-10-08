import { Fragment, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Block, Inline, ListBlock, ListChild } from "@/lib/blog/types";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inline, i) => {
        let node: React.ReactNode = inline.text;
        if (inline.code) node = <code>{node}</code>;
        if (inline.bold) node = <strong>{node}</strong>;
        if (inline.italic) node = <em>{node}</em>;
        if (inline.href) {
          const isExternal = inline.href.startsWith("http");
          node = (
            <a
              href={inline.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            >
              {node}
            </a>
          );
        }
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

function Paragraph({ inlines }: { inlines: Inline[] }) {
  return (
    <p>
      <Inlines inlines={inlines} />
    </p>
  );
}

function Quote({ inlines, source }: { inlines: Inline[]; source?: string }) {
  return (
    <blockquote>
      <p className="!mb-0">
        <Inlines inlines={inlines} />
      </p>
      {source && <footer>—— {source}</footer>}
    </blockquote>
  );
}

function ListChildView({ child }: { child: ListChild }) {
  switch (child.type) {
    case "list":
      return <List list={child} />;
    case "paragraph":
      return <Paragraph inlines={child.inlines} />;
    case "quote":
      return <Quote inlines={child.inlines} source={child.source} />;
    case "code":
      return <CodeBlock block={child} />;
  }
}

function List({ list }: { list: ListBlock }) {
  const Tag = list.ordered ? "ol" : "ul";
  return (
    <Tag>
      {list.items.map((item, i) => (
        <li key={i}>
          <Inlines inlines={item.inlines} />
          {item.children?.map((child, j) => (
            <ListChildView key={j} child={child} />
          ))}
        </li>
      ))}
    </Tag>
  );
}

function CodeBlock({ block }: { block: Extract<Block, { type: "code" }> }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  const label =
    state === "copied" ? "已複製" : state === "failed" ? "複製失敗，請手動選取" : "複製";
  return (
    <figure className="code-block">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border pl-5 pr-2 text-sm text-muted-foreground">
        <span className="font-mono">{block.language ?? "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-foreground transition-colors duration-200 hover:bg-surface-2"
        >
          {state === "copied" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          <span aria-live="polite">{label}</span>
        </button>
      </div>
      {/* tabIndex 讓鍵盤使用者可以橫向捲動長程式碼 */}
      <pre tabIndex={0} aria-label={block.caption ?? "程式碼"}>
        <code>{block.code}</code>
      </pre>
      {block.caption && (
        <figcaption className="border-t border-border px-5 py-3 !text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph inlines={block.inlines} />;
    case "heading": {
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag id={block.id}>
          <Inlines inlines={block.inlines} />
        </Tag>
      );
    }
    case "list":
      return <List list={block} />;
    case "quote":
      return <Quote inlines={block.inlines} source={block.source} />;
    case "scripture":
      return (
        <figure className="scripture">
          <blockquote className="!m-0 !border-0 !p-0">
            <p className="!mb-0">
              <Inlines inlines={block.inlines} />
            </p>
          </blockquote>
          <figcaption>
            <cite className="not-italic">{block.reference}</cite>
            {block.version && `（${block.version}）`}
          </figcaption>
        </figure>
      );
    case "callout":
      return (
        <p className="callout">
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "image":
      return (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            loading="lazy"
            decoding="async"
          />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "table": {
      const [head, ...body] = block.hasHeader ? block.rows : [undefined, ...block.rows];
      return (
        <div
          className="scroll-x my-7"
          role="region"
          tabIndex={0}
          aria-label={block.caption ?? "表格"}
        >
          <table>
            {block.caption && <caption>{block.caption}</caption>}
            {head && (
              <thead>
                <tr>
                  {head.map((cell, i) => (
                    <th key={i} scope="col">
                      <Inlines inlines={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>
                  {row?.map((cell, c) => (
                    <td key={c}>
                      <Inlines inlines={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "code":
      return <CodeBlock block={block} />;
    case "divider":
      return <hr />;
  }
}

/** 把內容契約的區塊渲染成語意 HTML；排版樣式在 blog.css 的 .prose。 */
export default function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
