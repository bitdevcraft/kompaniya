import { useEmailEditorContext } from "../../../context/email-editor-context";
import { Input } from "../../ui/input";

export function SectionPanel() {
  const { editor, selectedNode } = useEmailEditorContext();
  if (!selectedNode) return null;

  const attrs = selectedNode.attrs as {
    backgroundColor?: string;
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
        <label className="text-xs font-medium text-slate-600">Background</label>
        <Input
          onChange={(event) => update({ backgroundColor: event.target.value })}
          type="color"
          value={attrs.backgroundColor ?? "#ffffff"}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Padding</label>
        <Input
          onChange={(event) => update({ padding: event.target.value })}
          placeholder="20px"
          value={attrs.padding ?? ""}
        />
      </div>
    </div>
  );
}
