export interface SectionManifest {
  id: string;
  selector: string;
  fallbackSelectors?: string[];
  required: boolean;
  order: number;
  children?: ChildManifest[];
  viewport?: "desktop" | "mobile" | "both";
  currysEvidence?: string;
}

export interface ChildManifest {
  role: string;
  selector: string;
  required: boolean;
  expectedCount?: { min: number; max?: number };
}

export interface TemplateManifest {
  templateId: string;
  description: string;
  testUrl: string;
  setupFn?: string;
  sections: SectionManifest[];
}
