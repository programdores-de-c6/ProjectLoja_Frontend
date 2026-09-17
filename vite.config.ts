import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

import fs from 'node:fs/promises';
import nodePath from 'node:path';
import path from 'node:path';

import { componentTagger } from 'lovable-tagger';

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

function cdnPrefixImages(): Plugin {
  const DEBUG =
    process.env.CDN_IMG_DEBUG === '1';

  let publicDir = '';

  const imageSet =
    new Set<string>();

  const isAbsolute = (
    value: string
  ): boolean =>
    /^(?:[a-z]+:)?\/\//i.test(value)
    || value.startsWith('data:')
    || value.startsWith('blob:');

  const normalizeRef = (
    value: string
  ): string => {

    let s =
      value.trim();

    if (isAbsolute(s)) {
      return s;
    }

    s =
      s.replace(
        /^(?:\.\.\/|\.\/)+/,
        ''
      );

    while (
      s.startsWith('../')
    ) {
      s =
        s.slice(3);
    }

    if (
      s.startsWith('/')
    ) {
      s =
        s.slice(1);
    }

    if (
      !s.startsWith('images/')
    ) {
      return value;
    }

    return `/${s}`;
  };

  const toCDN = (
    value: string,
    cdn: string
  ): string => {

    const normalized =
      normalizeRef(value);

    if (
      isAbsolute(normalized)
    ) {
      return normalized;
    }

    if (
      !normalized.startsWith(
        '/images/'
      )
    ) {
      return value;
    }

    if (
      !imageSet.has(normalized)
    ) {
      return value;
    }

    const base =
      cdn.endsWith('/')
        ? cdn
        : `${cdn}/`;

    return (
      base +
      normalized.slice(1)
    );
  };

  const rewriteSrcsetList = (
    value: string,
    cdn: string
  ): string =>
    value
      .split(',')
      .map(
        (
          part: string
        ): string => {

          const [
            url,
            desc,
          ] =
            part
              .trim()
              .split(
                /\s+/,
                2
              );

          const output =
            toCDN(
              url ?? '',
              cdn
            );

          return desc
            ? `${output} ${desc}`
            : output;
        }
      )
      .join(', ');

  const rewriteHtml = (
    html: string,
    cdn: string
  ): string => {

    html =
      html.replace(
        /(src|href)\s*=\s*(['"])([^'"]+)\2/g,
        (
          _match: string,
          key: string,
          quote: string,
          value: string
        ): string =>
          `${key}=${quote}${toCDN(
            value,
            cdn
          )}${quote}`
      );

    html =
      html.replace(
        /(srcset)\s*=\s*(['"])([^'"]+)\2/g,
        (
          _match: string,
          key: string,
          quote: string,
          list: string
        ): string =>
          `${key}=${quote}${rewriteSrcsetList(
            list,
            cdn
          )}${quote}`
      );

    return html;
  };

  const rewriteCssUrls = (
    code: string,
    cdn: string
  ): string =>
    code.replace(
      /url\((['"]?)([^'")]+)\1\)/g,
      (
        _match: string,
        quote: string,
        value: string
      ): string =>
        `url(${quote}${toCDN(
          value,
          cdn
        )}${quote})`
    );

  const rewriteJsxAst = (
    code: string,
    id: string,
    cdn: string
  ): string | null => {

    const ast =
      parse(
        code,
        {
          sourceType:
            'module',
          plugins: [
            'typescript',
            'jsx',
          ],
        }
      );

    let rewrites = 0;

    traverse(
      ast as never,
      {
        JSXAttribute(
          jsxPath
        ) {

          const name =
            typeof jsxPath.node.name === 'object'
              && jsxPath.node.name !== null
              && 'name' in jsxPath.node.name
              ? String(
                  (
                    jsxPath.node.name as {
                      name?: unknown;
                    }
                  ).name
                )
              : '';

          const isSrc =
            name === 'src'
            || name === 'href';

          const isSrcSet =
            name === 'srcSet'
            || name === 'srcset';

          if (
            !isSrc
            && !isSrcSet
          ) {
            return;
          }

          const value =
            jsxPath.node.value;

          if (!value) {
            return;
          }

          if (
            value.type === 'StringLiteral'
          ) {

            const literal =
              value as {
                value: string;
              };

            const before =
              literal.value;

            literal.value =
              isSrc
                ? toCDN(
                    literal.value,
                    cdn
                  )
                : rewriteSrcsetList(
                    literal.value,
                    cdn
                  );

            if (
              literal.value !== before
            ) {
              rewrites++;
            }

            return;
          }

          if (
            value.type === 'JSXExpressionContainer'
            && value.expression
            && value.expression.type === 'StringLiteral'
          ) {

            const expression =
              value.expression as {
                value: string;
              };

            const before =
              expression.value;

            expression.value =
              isSrc
                ? toCDN(
                    expression.value,
                    cdn
                  )
                : rewriteSrcsetList(
                    expression.value,
                    cdn
                  );

            if (
              expression.value !== before
            ) {
              rewrites++;
            }
          }
        },

        StringLiteral(
          stringPath
        ) {

          const parent =
            stringPath.parent;

          if (
            parent
            && parent.type === 'ObjectProperty'
            && stringPath.parentKey === 'key'
            && !(parent as {
              computed?: boolean;
            }).computed
          ) {
            return;
          }

          if (
            parent
            && (
              parent.type === 'ImportDeclaration'
              || parent.type === 'ExportAllDeclaration'
              || parent.type === 'ExportNamedDeclaration'
            )
          ) {
            return;
          }

          if (
            stringPath.findParent(
              parentPath =>
                parentPath.node.type === 'JSXAttribute'
            )
          ) {
            return;
          }

          const before =
            stringPath.node.value;

          const after =
            toCDN(
              before,
              cdn
            );

          if (
            after !== before
          ) {

            stringPath.node.value =
              after;

            rewrites++;
          }
        },

        TemplateLiteral(
          templatePath
        ) {

          if (
            templatePath.node
              .expressions.length
          ) {
            return;
          }

          const raw =
            templatePath.node
              .quasis
              .map(
                quasi =>
                  quasi.value.cooked
                  ?? quasi.value.raw
              )
              .join('');

          const after =
            toCDN(
              raw,
              cdn
            );

          if (
            after !== raw
          ) {

            templatePath.replaceWith(
              {
                type: 'StringLiteral',
                value: after,
              }
            );

            rewrites++;
          }
        },
      }
    );

    if (!rewrites) {
      return null;
    }

    const output =
      generate(
        ast as never,
        {
          retainLines:
            true,
          sourceMaps:
            false,
        },
        code
      ).code;

    if (DEBUG) {
      console.log(
        `[cdn] ${id} → ${rewrites} rewrites`
      );
    }

    return output;
  };

  async function collectPublicImagesFrom(
    dir: string
  ): Promise<void> {

    const imagesDir =
      nodePath.join(
        dir,
        'images'
      );

    const stack: string[] =
      [imagesDir];

    while (
      stack.length
    ) {

      const current =
        stack.pop();

      if (!current) {
        continue;
      }

      let entries:
        Array<
          import('node:fs').Dirent<string>
        >;

      try {

        entries =
          await fs.readdir(
            current,
            {
              withFileTypes:
                true,
              encoding:
                'utf8',
            }
          );

      } catch {

        continue;
      }

      for (
        const entry of entries
      ) {

        const full =
          nodePath.join(
            current,
            entry.name
          );

        if (
          entry.isDirectory()
        ) {

          stack.push(
            full
          );

        } else if (
          entry.isFile()
        ) {

          const relative =
            nodePath
              .relative(
                dir,
                full
              )
              .split(
                nodePath.sep
              )
              .join('/');

          const canonical =
            `/${relative}`;

          imageSet.add(
            canonical
          );

          imageSet.add(
            canonical.slice(1)
          );
        }
      }
    }
  }

  return {
    name:
      'cdn-prefix-images-existing',

    apply:
      'build',

    enforce:
      'pre',

    configResolved(
      config
    ) {

      publicDir =
        config.publicDir;

      if (DEBUG) {
        console.log(
          '[cdn] publicDir =',
          publicDir
        );
      }
    },

    async buildStart() {

      await collectPublicImagesFrom(
        publicDir
      );

      if (DEBUG) {
        console.log(
          '[cdn] images found:',
          imageSet.size
        );
      }
    },

    transformIndexHtml(
      html: string
    ) {

      const cdn =
        process.env.CDN_IMG_PREFIX;

      if (!cdn) {
        return html;
      }

      const output =
        rewriteHtml(
          html,
          cdn
        );

      if (DEBUG) {
        console.log(
          '[cdn] transformIndexHtml done'
        );
      }

      return output;
    },

    transform(
      code: string,
      id: string
    ) {

      const cdn =
        process.env.CDN_IMG_PREFIX;

      if (!cdn) {
        return null;
      }

      if (
        /\.(jsx|tsx)$/.test(
          id
        )
      ) {

        const output =
          rewriteJsxAst(
            code,
            id,
            cdn
          );

        return output
          ? {
              code: output,
              map: null,
            }
          : null;
      }

      if (
        /\.(css|scss|sass|less|styl)$/i.test(
          id
        )
      ) {

        const output =
          rewriteCssUrls(
            code,
            cdn
          );

        return output === code
          ? null
          : {
              code: output,
              map: null,
            };
      }

      return null;
    },
  };
}

export default defineConfig(
  ({ mode }) => ({
    server: {
      host:
        '::',
      port:
        3001,
    },

    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',
  devOptions: {
    enabled: true,
  },
        manifest: {
          name: 'Sistema de Loja',
          short_name: 'Sistema Loja',
          description: 'Sistema de gestão e vendas multi-loja.',
          lang: 'pt-PT',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'landscape',

          theme_color: '#2563eb',
          background_color: '#ffffff',

        icons: [
  {
    src: '/images/pwa-192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/images/pwa-512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any maskable',
  },
],


        },

        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/',
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}',
          ],
        },
      }),

      mode ===
        'development'
        ? componentTagger()
        : null,

      cdnPrefixImages(),
    ].filter(
      (
        plugin
      ): plugin is Plugin =>
        plugin !== null
    ),

    resolve: {
      alias: {

        '@':
          path.resolve(
            __dirname,
            './src'
          ),

        'react-router-dom':
          path.resolve(
            __dirname,
            './src/lib/react-router-dom-proxy.tsx'
          ),

        'react-router-dom-original':
          'react-router-dom',
      },
    },

    define: {

      __ROUTE_MESSAGING_ENABLED__:
        JSON.stringify(
          mode === 'production'
            ? process.env
                .VITE_ENABLE_ROUTE_MESSAGING ===
              'true'
            : process.env
                .VITE_ENABLE_ROUTE_MESSAGING !==
              'false'
        ),
    },
  })
);
