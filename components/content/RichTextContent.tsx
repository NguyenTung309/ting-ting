import type { ReactNode } from "react";

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
  fields?: { url?: string; newTab?: boolean };
  level?: number;
  format?: string;
};

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (typeof node.text === "string") return node.text;

  const children = node.children?.map((child, index) => renderNode(child, `${key}-${index}`));

  switch (node.type) {
    case "h1":
      return <h1 key={key}>{children}</h1>;
    case "h2":
      return <h2 key={key}>{children}</h2>;
    case "h3":
      return <h3 key={key}>{children}</h3>;
    case "heading":
      if (node.level === 1) return <h1 key={key}>{children}</h1>;
      if (node.level === 3) return <h3 key={key}>{children}</h3>;
      return <h2 key={key}>{children}</h2>;
    case "list":
      return node.format === "ordered"
        ? <ol key={key}>{children}</ol>
        : <ul key={key}>{children}</ul>;
    case "ul":
      return <ul key={key}>{children}</ul>;
    case "list-item":
    case "listitem":
    case "li":
      return <li key={key}>{children}</li>;
    case "quote":
      return <blockquote key={key}>{children}</blockquote>;
    case "link":
      return (
        <a key={key} href={node.fields?.url} target={node.fields?.newTab ? "_blank" : undefined} rel={node.fields?.newTab ? "noreferrer" : undefined}>
          {children}
        </a>
      );
    case "paragraph":
    default:
      return <p key={key}>{children}</p>;
  }
}

export function RichTextContent({ value }: { value: unknown }) {
  if (typeof value === "string") return <div className="rich-text">{value}</div>;

  if (Array.isArray(value)) {
    return <div className="rich-text">{value.map((node, index) => renderNode(node as RichTextNode, String(index)))}</div>;
  }

  const root = value as { root?: RichTextNode } | null;
  const children = root?.root?.children;
  if (!children) return null;

  return <div className="rich-text">{children.map((node, index) => renderNode(node, String(index)))}</div>;
}
