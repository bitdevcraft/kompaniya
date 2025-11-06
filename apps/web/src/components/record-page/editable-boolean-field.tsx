import { Switch } from "@repo/shared-ui/components/common/switch";

import { BooleanField, type BooleanFieldProps } from "./boolean-field";

interface EditableBooleanFieldProps extends BooleanFieldProps {
  editing: boolean;
  name: string;
  onChange: (name: string, value: boolean) => void;
}

export function EditableBooleanField({
  editing,
  label,
  name,
  onChange,
  tone,
  value,
}: EditableBooleanFieldProps) {
  if (!editing) {
    return <BooleanField label={label} tone={tone} value={value} />;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Switch
        checked={value}
        id={name}
        name={name}
        onCheckedChange={(checked) => onChange(name, checked)}
      />
    </div>
  );
}
