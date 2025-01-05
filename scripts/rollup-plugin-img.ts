import { writeFile } from 'node:fs/promises';
import path, { join } from 'node:path';
import { Plugin } from 'rollup';
import fs from 'fs';

// 构建 .vtex 文件内容
let imagePrecacheContent = `.image-precache {\n`;

export default function LoadImage(options: { imagesPath: string }): Plugin {
    let hasRun = false; // 标记插件是否已运行
    const generateVtexFile = (imagesPath: string) => {
        const outPathBase = join(
            __dirname,
            '../addon/content/panorama/images/custom_game'
        );
        const cssPath = join(
            __dirname,
            '../addon/content/panorama/styles/custom_game'
        );

        // 遍历 imagesPath 中的所有图片
        const traverseDirectory = (dir: string) => {
            const imageFiles = fs.readdirSync(dir); // 读取目录中的文件

            imageFiles.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath); // 获取文件状态

                if (stat.isDirectory()) {
                    // 如果是目录，递归调用
                    traverseDirectory(filePath);
                } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
                    // 生成输出文件路径，保持与原文件相同的目录

                    const outputFile = filePath.replace(
                        options.imagesPath,
                        outPathBase
                    );
                    const outputDir = path.dirname(outputFile);
                    const relativePath = path.relative(
                        options.imagesPath,
                        filePath
                    ).replace(/\\/g, "/");;


                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true }); // 创建目标目录
                    }

                    fs.copyFileSync(filePath, outputFile);

                    imagePrecacheContent += `background-image: url("file://{images}/custom_game/${relativePath}");\n`

                    console.log(
                        `[rollup-plugin-vtex.ts] ${outputFile} 已复制`
                    );
                }
            });

        };

        traverseDirectory(options.imagesPath); // 开始遍历指定的图片目录
        imagePrecacheContent += '}'
        fs.writeFileSync(
            `${cssPath}/precache.css`,
            imagePrecacheContent,
            'utf-8'
        ); // 写入文件
    };

    return {
        name: 'create-vtex',
        buildStart() {
            if (hasRun) {
                return;
            }
            hasRun = true;
            this.addWatchFile(options.imagesPath); // 监视 imagesPath 以便在文件变化时重新构建
            generateVtexFile(options.imagesPath);
        },
        watchChange(id) {
            if (id.startsWith(options.imagesPath)) {
                // 如果监视的文件发生变化，重新生成 .vtex 文件
                generateVtexFile(options.imagesPath);
            }
        }
    };
}
