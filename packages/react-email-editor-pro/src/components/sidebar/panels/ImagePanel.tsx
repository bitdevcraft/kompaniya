import { useEmailEditorContext } from "../../../context/email-editor-context";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";

export function ImagePanel() {
  const { editor, selectedNode } = useEmailEditorContext();
  if (!selectedNode) return null;

  const attrs = selectedNode.attrs as {
    src?: string;
    width?: string;
    padding?: string;
    align?: "left" | "center" | "right";
    alt?: string;
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
        <label className="text-xs font-medium text-slate-600">Image URL</label>
        <Input
          onChange={(event) => update({ src: event.target.value })}
          placeholder="https://"
          value={attrs.src ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Alt text</label>
        <Input
          onChange={(event) => update({ alt: event.target.value })}
          placeholder="Description"
          value={attrs.alt ?? ""}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Width</label>
        <Input
          onChange={(event) => update({ width: event.target.value })}
          placeholder="100%"
          value={attrs.width ?? ""}
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
