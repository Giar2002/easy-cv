import ModernTemplate from './ModernTemplate';
import { TemplateProps } from './shared';

export default function CreativeTemplate({ data }: TemplateProps) {
    // Keep Creative using Modern structure so `.template-creative` CSS hooks
    // apply consistently across all sections.
    return <ModernTemplate data={data} />;
}
