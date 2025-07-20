
'use server';

import { verifyFace } from "@/ai/flows/verify-face";
import type { VerifyFaceInput } from "@/ai/flows/verify-face.types";

export async function verifyFaceAction(input: VerifyFaceInput) {
    return await verifyFace(input);
}
