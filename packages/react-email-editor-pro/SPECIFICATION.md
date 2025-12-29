# Specification: React Email Editor Pro (`react-email-editor-pro`)

## 1. Project Overview

A modular, TypeScript-based React component library for building responsive emails. The editor provides a Notion-like WYSIWYG experience with drag-and-drop capabilities, slash commands, and a robust property editor. It exports to JSON, MJML, and standard HTML.

- **Target:** NPM Package
- **Primary Framework:** React + TypeScript
- **Editor Core:** Tiptap (Headless wrapper)
- **Styling:** Tailwind CSS + Shadcn UI
- **Email Engine:** MJML (via browser-side compilation)

## 2. Technical Stack

| Category       | Technology                              | Usage                                                 |
| -------------- | --------------------------------------- | ----------------------------------------------------- |
| **Core**       | `react`, `tiptap-react`, `@tiptap/core` | Main editor engine and state management.              |
| **Language**   | `typescript`                            | Strict typing for block schemas and props.            |
| **Styling**    | `tailwindcss`, `clsx`, `tailwind-merge` | Utility-first styling for the editor UI.              |
| **Components** | `shadcn/ui` (Radix Primitives)          | UI components (Accordions, Inputs, Selects, Dialogs). |
| **DnD**        | `dnd-kit` or Tiptap NodeViews           | Drag-and-drop logic for reordering blocks/sections.   |
| **Parsing**    | `mjml-browser`                          | Compiling JSON/MJML to HTML on the client side.       |
| **Icons**      | `lucide-react`                          | UI Icons.                                             |

## 3. Data Model (JSON Schema)

The editor state will be maintained as a JSON tree (Tiptap JSON). Custom Tiptap extensions will be created to map MJML components to Tiptap nodes.

### 3.1 Base Node Structure

Every node (Section, Column, Text, Image, Button) follows this schema:

```typescript
interface EmailNode {
  type: "mj-section" | "mj-column" | "mj-image" | "mj-text" | "mj-button";
  attrs: {
    // MJML specific attributes map directly here
    width?: string;
    height?: string;
    backgroundColor?: string;
    padding?: string;
    align?: "left" | "center" | "right";
    src?: string; // for images
    href?: string; // for links/buttons
    // ...other css/mjml properties
  };
  content?: EmailNode[]; // Nested nodes (e.g., Section -> Column -> Image)
}
```

## 4. UI/UX Layout Specification

The layout consists of three main areas: **Header**, **Canvas**, and **Property Sidebar**.

### 4.1 Header (Toolbar)

- **Device Toggle:** Segmented control to switch Canvas width.
  - _Mobile:_ 320px
  - _Tablet:_ 768px
  - _Desktop:_ 100% (or 600px centered)
- **Export Actions:**
  - `Export JSON`: Dumps current Tiptap state.
  - `Export MJML`: Converts state to MJML XML string.
  - `Export HTML`: Compiles MJML to browser-ready HTML.
- **Undo/Redo:** Standard Tiptap history controls.

### 4.2 Main Canvas (The Editor)

- **Visual Style:** Centered grey background with a white "Paper" area representing the email.
- **Interactions:**
  - **Hover:** Hovering a block (Section/Row) highlights it with a blue dashed border.
  - **Click:** Clicking a block selects it and populates the **Property Sidebar**.
  - **Slash Command:** Typing `/` triggers a floating menu to insert blocks (Image, Button, Divider, 2 Columns, 3 Columns).
  - **Drag Handle:** A "six-dot" handle appears on the left of the active block to drag-and-drop vertically.

### 4.3 Property Sidebar (Attribute Editor)

- **Context Aware:** The content changes based on the currently selected node (e.g., clicking an Image shows Image Attributes).
- **UI Components:** Uses `shadcn/ui` Form components.
- **Inputs:** Text fields for URLs, Alt Text.
- **Sliders/Inputs:** For Width, Height, Padding, Margin with px/rem toggles.
- **Color Picker:** For Backgrounds, Text Color, Border Color.
- **Align Toggle:** Icons for Left/Center/Right alignment.
- **Live Update:** Changing a value in the sidebar immediately updates the Tiptap node attributes.

## 5. Component Implementation Strategy

### 5.1 Custom Tiptap Extensions

We will not use standard HTML nodes. We will create custom NodeViews for MJML tags.

**Example: `MjImageExtension`**

```typescript
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageComponent } from "./ImageComponent";

export const MjImage = Node.create({
  name: "mj-image",
  group: "block",
  atom: true, // It is a leaf node (cannot contain other nodes)

  addAttributes() {
    return {
      src: { default: "https://placeholder.co/150" },
      width: { default: "auto" },
      align: { default: "center" },
      padding: { default: "10px" },
    };
  },

  parseHTML() {
    return [{ tag: "mj-image" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mj-image", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
```

### 5.2 The Rendered Node Component (`ImageComponent.tsx`)

This component renders inside the editor. It must handle the "Selected" state styling.

```tsx
export const ImageComponent = (props) => {
  const { node, updateAttributes, selected } = props;

  return (
    <NodeViewWrapper
      className={clsx("relative", selected && "ring-2 ring-blue-500")}
    >
      <img
        src={node.attrs.src}
        style={{ width: node.attrs.width, padding: node.attrs.padding }}
      />
      {/* Resizing logic or overlay can go here */}
    </NodeViewWrapper>
  );
};
```

### 5.3 The Property Sidebar Logic

A hook `useEditorContext` will track the `editor.state.selection`.

**Logic:**

1. Get the currently active node type.
2. Map attributes (`node.attrs`) to form fields.
3. `onChange` of form field calls `editor.chain().focus().updateAttributes(nodeType, { [key]: value }).run()`.

## 6. Notion-Like Features

### 6.1 Slash Menu

- **Trigger:** Typing `/` at the start of a text block.
- **Options:**
  - Heading 1, 2, 3
  - Text Block
  - Image (Upload or Link)
  - Button
  - Spacer
  - Layout: 2 Columns, 3 Columns

### 6.2 Drag and Drop

- Use a Tiptap extension like `drag-handle-plugin` or wrap NodeViews in a `draggable` container.
- Logic: allow moving `mj-section` vertically. Allow moving `mj-column` horizontally within sections.

## 7. Exporting Logic

### 7.1 JSON to MJML

Since Tiptap stores JSON, we need a serializer that traverses the JSON tree and constructs an MJML string.

```typescript
function jsonToMjml(node) {
  if (node.type === "text") return node.text;

  const childrenMjml = node.content.map(jsonToMjml).join("");
  const attrsString = Object.entries(node.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

  return `<${node.type} ${attrsString}>${childrenMjml}</${node.type}>`;
}
```

### 7.2 MJML to HTML

Use `mjml-browser` to compile the resulting string from 7.1 into responsive HTML.

## 8. Package API (Exports)

The user of this package will implement it as follows:

```tsx
import { EmailEditor, EmailEditorProvider } from "react-email-editor-pro";

function App() {
  const handleExport = (html, mjml, json) => {
    console.log("Exported Email:", html);
  };

  return (
    <EmailEditorProvider>
      <div className="h-screen w-full">
        <EmailEditor
          initialContent={initialJson}
          onExport={handleExport}
          theme="light"
        />
      </div>
    </EmailEditorProvider>
  );
}
```

## 9. Directory Structure

```text
/src
  /components
    /editor
      EditorCanvas.tsx      # Tiptap implementation
      MenuBar.tsx           # Slash commands / floating menu
      DraggableBlock.tsx    # Wrapper for drag handles
    /sidebar
      Sidebar.tsx           # Main container
      /panels
        ImagePanel.tsx      # Form for image attrs
        TextPanel.tsx       # Form for text attrs
        SectionPanel.tsx    # Form for section/bg attrs
    /ui                     # Shadcn components (Button, Input, etc)
  /extensions
    MjSection.ts
    MjColumn.ts
    MjImage.ts
    MjText.ts
  /lib
    mjml-generator.ts       # JSON -> MJML converter
    utils.ts
  index.ts                  # Main export
```

## 10. Next Steps for Implementation

1. Initialize project with `tsup` or `vite` library mode.
2. Install `tiptap` and `shadcn` dependencies.
3. Create the `MjSection` and `MjColumn` extensions (the hardest part: nested layouts).
4. Build the Sidebar to read/write Tiptap attributes.
5. Implement the MJML serializer.
