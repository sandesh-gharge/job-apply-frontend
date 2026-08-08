export interface Template {
  _id: string;
  name: string;
  html_template: string;
  isPublic: boolean;
  userId: string;
}

export interface TemplatesState {
  cvTemplates: Template[];
  clTemplates: Template[];
  loading: boolean;
  error: string | null;
  previewHtml: string | null;
}

export const initialTemplatesState: TemplatesState = {
  cvTemplates: [],
  clTemplates: [],
  loading: false,
  error: null,
  previewHtml: null
};
