import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

// Renders one component to an HTML string, as the build would.
export async function render(
  component: AstroComponentFactory,
  options: { props?: Record<string, unknown>; slots?: Record<string, string> } = {},
): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(component, options);
}
