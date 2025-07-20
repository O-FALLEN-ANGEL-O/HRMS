
'use server';

import { verifyFace, VerifyFaceInput } from "@/ai/flows/verify-face";

export async function verifyFaceAction(input: VerifyFaceInput) {
    return await verifyFace(input);
}
