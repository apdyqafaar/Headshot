import { config } from "@/config";
import { HEADSHOT_STYLES } from "@/services";
import z, { json, refine } from "zod";

export const uploadPhotoSchema=z.object({
    styles:z
    .string()
    .optional()
    .default("[]")
    .transform((val)=>JSON.parse(val))
    .pipe(
        z.array(z.string())
        .max(config.upload.maxStyles, `Maximum ${config.upload.maxStyles} styles allowed`)
        .refine((arr)=>arr.length ===0 || arr.every(s=>s in HEADSHOT_STYLES), "Invalid styles selected")
    ),
    prompt:z.string().optional()
})
.refine((data)=>data.styles.length >0 || (data.prompt?.trim() && data.prompt), "Either select at least one style or provide a custom prompt")

export type UploadPhotoParams=z.infer<typeof uploadPhotoSchema>