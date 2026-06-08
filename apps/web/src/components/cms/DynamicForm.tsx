import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cleanText } from "@/lib/text";

interface Field {
  id: string;
  key: string;
  label: string;
  help_text: string | null;
  type: string;
  required: boolean;
  options: Array<{ label: string; value: string }> | any;
  position: number;
}

interface FormDef {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  success_message: string;
}

interface Props {
  slug: string;
  /** Optional override of the heading/intro (e.g. when embedded inside another section). */
  hideHeader?: boolean;
  onSubmitted?: () => void;
}

export default function DynamicForm({ slug, hideHeader, onSubmitted }: Props) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["form-def", slug],
    queryFn: async () => {
      const { data: form } = await supabase
        .from("form_definitions")
        .select("id, slug, title, description, success_message")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      if (!form) return null;
      const { data: fields } = await supabase
        .from("form_fields")
        .select("id, key, label, help_text, type, required, options, position")
        .eq("form_id", form.id)
        .order("position");
      return { form: form as FormDef, fields: (fields ?? []) as Field[] };
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading form...</div>;
  if (!data) return <div className="text-sm text-destructive">Form not found.</div>;
  const { form, fields } = data;

  if (done) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-base font-semibold text-foreground">{cleanText(form.success_message)}</p>
      </div>
    );
  }

  const setField = (k: string, v: any) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (values[f.key] === undefined || values[f.key] === "" || values[f.key] === null)) {
        toast.error(`${cleanText(f.label)} is required`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-form", {
        body: { form_slug: slug, payload: values },
      });
      if (error) throw error;
      setDone(true);
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hideHeader && (
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{cleanText(form.title)}</h3>
          {form.description && <p className="text-sm text-muted-foreground cms-body">{cleanText(form.description)}</p>}
        </div>
      )}
      {fields.map((f) => {
        const label = cleanText(f.label);
        const help = f.help_text ? cleanText(f.help_text) : null;
        const opts = Array.isArray(f.options) ? f.options : [];
        return (
          <div key={f.id} className="space-y-1.5">
            <Label htmlFor={f.key}>
              {label}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            {f.type === "textarea" ? (
              <Textarea id={f.key} value={values[f.key] ?? ""} onChange={(e) => setField(f.key, e.target.value)} />
            ) : f.type === "select" ? (
              <Select value={values[f.key] ?? ""} onValueChange={(v) => setField(f.key, v)}>
                <SelectTrigger id={f.key}><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {opts.map((o: any) => (
                    <SelectItem key={o.value} value={o.value}>{cleanText(o.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : f.type === "checkbox" ? (
              <div className="flex items-center gap-2">
                <Checkbox id={f.key} checked={!!values[f.key]} onCheckedChange={(c) => setField(f.key, !!c)} />
                <Label htmlFor={f.key} className="text-sm font-normal">{label}</Label>
              </div>
            ) : f.type === "multicheck" ? (
              <div className="space-y-1.5">
                {opts.map((o: any) => {
                  const arr: string[] = values[f.key] ?? [];
                  const checked = arr.includes(o.value);
                  return (
                    <div key={o.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`${f.key}-${o.value}`}
                        checked={checked}
                        onCheckedChange={(c) => {
                          const next = c ? [...arr, o.value] : arr.filter((x) => x !== o.value);
                          setField(f.key, next);
                        }}
                      />
                      <Label htmlFor={`${f.key}-${o.value}`} className="text-sm font-normal">{cleanText(o.label)}</Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Input
                id={f.key}
                type={f.type === "email" ? "email" : f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : f.type === "phone" ? "tel" : "text"}
                value={values[f.key] ?? ""}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            )}
            {help && <p className="text-xs text-muted-foreground">{help}</p>}
          </div>
        );
      })}
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending..." : "Submit"}
      </Button>
    </form>
  );
}