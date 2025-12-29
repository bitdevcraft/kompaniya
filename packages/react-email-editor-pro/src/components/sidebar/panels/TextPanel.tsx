import { useEmailEditorContext } from "../../../context/email-editor-context";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";

export function TextPanel() {
  const { editor, selectedNode } = useEmailEditorContext();
  if (!selectedNode) return null;

  const attrs = selectedNode.attrs as {
    align?: "left" | "center" | "right";
    color?: string;
    fontSize?: string;
    padding?: string;
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
        <label className="text-xs font-medium text-slate-600">Align</label>
        <Select
          onChange={(event) =>
            update({ align: event.target.value as "left" | "center" | "right" })
          }
          value={attrs.align ?? "left"}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Text color</label>
        <Input
          onChange={(event) => update({ color: event.target.value })}
          type="color"
          value={attrs.color ?? "#111827"}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Font size</label>
        <Input
          onChange={(event) => update({ fontSize: event.target.value })}
          placeholder="14px"
          value={attrs.fontSize ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Padding</label>
        <Input
          onChange={(event) => update({ padding: event.target.value })}
          placeholder="10px"
          value={attrs.padding ?? ""}
        />
      </div>
    </div>
  );
}
