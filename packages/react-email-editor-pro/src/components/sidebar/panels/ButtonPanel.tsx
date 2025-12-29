import { useEmailEditorContext } from "../../../context/email-editor-context";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";

export function ButtonPanel() {
  const { editor, selectedNode } = useEmailEditorContext();
  if (!selectedNode) return null;

  const attrs = selectedNode.attrs as {
    href?: string;
    backgroundColor?: string;
    color?: string;
    padding?: string;
    align?: "left" | "center" | "right";
    text?: string;
  };

  const update = (nextAttrs: Partial<typeof attrs>) => {
    editor
      ?.chain()
      .focus()
      .updateAttributes(selectedNode.type, nextAttrs)
      .run();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-600">Text</label>
        <Input
          onChange={(event) => update({ text: event.target.value })}
          placeholder="Button"
          value={attrs.text ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Link</label>
        <Input
          onChange={(event) => update({ href: event.target.value })}
          placeholder="https://"
          value={attrs.href ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Background</label>
        <Input
          onChange={(event) => update({ backgroundColor: event.target.value })}
          type="color"
          value={attrs.backgroundColor ?? "#2563eb"}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Text color</label>
        <Input
          onChange={(event) => update({ color: event.target.value })}
          type="color"
          value={attrs.color ?? "#ffffff"}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Padding</label>
        <Input
          onChange={(event) => update({ padding: event.target.value })}
          placeholder="12px 24px"
          value={attrs.padding ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Align</label>
        <Select
          onChange={(event) =>
            update({ align: event.target.value as "left" | "center" | "right" })
          }
          value={attrs.align ?? "center"}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </div>
    </div>
  );
}
