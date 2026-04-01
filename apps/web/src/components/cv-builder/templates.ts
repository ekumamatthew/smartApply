import { CleanTemplate } from "./CleanTemplate"
import { ModernTemplate } from "./ModernTemplate"
import { SidebarTemplate } from "./SidebarTemplate"
import { CvTemplateDefinition } from "./types"

export const CV_TEMPLATE_DEFINITIONS: CvTemplateDefinition[] = [
  {
    id: "clean",
    label: "Clean",
    description: "Minimal and ATS-friendly single-column design.",
    Component: CleanTemplate,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Impact-focused modern layout with visual hierarchy.",
    Component: ModernTemplate,
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Two-column layout with profile sidebar.",
    Component: SidebarTemplate,
  },
]
