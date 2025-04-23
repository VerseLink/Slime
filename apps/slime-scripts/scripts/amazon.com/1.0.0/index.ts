import { SlimeScriptMetadata } from "@slime/runtime";
import type { ApplyCodeResult, PageInfo, SlimeScript, VariantProductDetail } from "@slime/runtime/v1";

export default {
    runtime: {
        version: 1,
    },
    getScript(page) {
        throw new Error("not implemented")
    },
} satisfies SlimeScriptMetadata;