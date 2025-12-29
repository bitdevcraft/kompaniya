import { useEmailEditorContext } from "../../context/email-editor-context";
import { ButtonPanel } from "./panels/ButtonPanel";
import { ColumnPanel } from "./panels/ColumnPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { SectionPanel } from "./panels/SectionPanel";
import { TextPanel } from "./panels/TextPanel";

export function Sidebar() {
  const { selectedNode } = useEmailEditorContext();

  return (
    <aside className="w-80 border-l border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Properties</h2>
      {!selectedNode && (
        <p className="text-sm text-slate-500">
          Select a block to edit its properties.
        </p>
      )}
      {selectedNode?.type === "mj-section" && <SectionPanel />}
      {selectedNode?.type === "mj-column" && <ColumnPanel />}
      {selectedNode?.type === "mj-text" && <TextPanel />}
      {selectedNode?.type === "mj-image" && <ImagePanel />}
      {selectedNode?.type === "mj-button" && <ButtonPanel />}
    </aside>
  );
}
