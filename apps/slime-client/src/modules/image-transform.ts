import 'wxt';
import { defineWxtModule } from 'wxt/modules';
import path, { resolve, relative, parse } from 'node:path';
import sharp from 'sharp';
import { ensureDir, exists } from 'fs-extra';

export default defineWxtModule<ImageTransformOptions[]>({
    name: 'image-transform',
    configKey: 'images',
    async setup(wxt, options) {
        if (options == null || options.length == 0)
            return;

        for (let option of options) {
            const resolvedPath = resolve(wxt.config.srcDir, option.from);

            if (option.enableWithMode && wxt.config.mode !== option.enableWithMode) {
                continue;
            }

            if (!(await exists(resolvedPath))) {
                wxt.logger.warn(
                    `\`[image-transform]\` Skipping image transform, no image found at ${relative(process.cwd(), resolvedPath)}`,
                );
                continue;
            }

            const assetFolder = wxt.config.outDir;
            const outputFolder = path.dirname(option.to);
            const resolvedOutputFolder = path.resolve(assetFolder, outputFolder);
            const resolvedOutput = path.resolve(assetFolder, option.to);

            if (option.asManifestIcon) {
                wxt.hooks.hook('build:manifestGenerated', async (wxt, manifest) => {
                    if (manifest.icons)
                        return wxt.logger.warn(
                            '`[image-transform]` icons property found in manifest, overwriting with auto-generated icons',
                        );

                    if (option.resize) {
                        manifest.icons = Object.fromEntries(
                            option.resize.map((size) => [size, option.to.replace("[width]", size.toString())]),
                        );
                    }
                    else {
                        const metadata = await sharp(resolvedPath).metadata();
                        if (metadata.width == null)
                            return wxt.logger.error(
                                "`[image-transform]` unable to determinate icon's width, no manifest icon has been written",
                            );
                        manifest.icons = { [metadata.width]: option.to };
                    }
                });
            }

            wxt.hooks.hook('build:done', async (wxt, output) => {
                
                ensureDir(resolvedOutputFolder);

                let image = sharp(resolvedPath);
                option.transform?.(image);

                if (option.resize == null || option.resize.length === 0) {
                    await image.toFile(resolvedOutput);
                    output.publicAssets.push({
                        type: 'asset',
                        fileName: resolvedOutput,
                    });
                    return;
                }

                for (const size of option.resize) {
                    const resizePath = resolvedOutput.replace("[width]", size.toString());
                    const resized = image.resize(size);
                    await resized.toFile(resizePath);

                    output.publicAssets.push({
                        type: 'asset',
                        fileName: resizePath,
                    });
                }
            });

            wxt.hooks.hook('prepare:publicPaths', (wxt, paths) => {
                if (option.resize == null || option.resize.length === 0) {
                    paths.push(resolvedOutput);
                    return;
                }

                for (const size of option.resize) {
                    const resizePath = resolvedOutput.replace("[width]", size.toString());
                    paths.push(resizePath);
                }
            });
        }
    },
});

/**
 * Options for the auto-icons module
 */
export interface ImageTransformOptions {
    /**
     * Path to the image to use.
     *
     * Path is relative to the project's src directory.
     * For example: "<srcDir>/assets/icon.png"
     */
    from: string;

    /**
     * The output folder of where the image should be generated.
     *
     */
    to: string;

    /**
     * Should the image be used as manifest icon or not
     * @default false
     */
    asManifestIcon?: boolean;

    /**
     * Should the transform occur if the config mode matches
     * @default undefined
     */
    enableWithMode?: string;

    /**
     * If the images should be resized
     * @default undefined
     */
    resize?: number[];

    /**
     * Perform image transformations like grayscale
     * @default undefined
     */
    transform?: (image: sharp.Sharp) => void;
}

declare module 'wxt' {
    export interface InlineConfig {
        images?: ImageTransformOptions[];
    }
}