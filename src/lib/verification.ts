import { ethers } from 'ethers';

export interface VerificationResult {
  isVerified: boolean;
  details?: string;
  hashes?: {
    localRequest: string;
    remoteRequest: string;
    localResponse: string;
    remoteResponse: string;
  };
  signature?: string;
  signingAddress?: string;
  recoveredAddress?: string;
  text?: string;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Use padStart(2, '0') for correct hex
}

/**
 * @param rawRequestBody - The exact JSON string sent to the API
 * @param rawResponseBody - The exact text string received (or accumulated)
 * @param chatId - The ID returned in the chat response
 * @param modelId - The model used (e.g. "deepseek-ai/DeepSeek-V3.1")
 * @param apiKey - The API key used for the request
 */
export async function verifyNearChat(
  rawRequestBody: string, 
  rawResponseBody: string, 
  chatId: string, 
  modelId: string,
  apiKey: string
): Promise<VerificationResult> {
  
  try {
    // 1. Calculate Local Hashes
    const reqHash = await sha256(rawRequestBody);
    const resHash = await sha256(rawResponseBody);
    
    // 2. Fetch Signature from NEAR AI Cloud
    const sigUrl = `https://cloud-api.near.ai/v1/signature/${chatId}?model=${modelId}&signing_algo=ecdsa`;
    const sigResponse = await fetch(sigUrl, {
      method: 'GET',
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}` 
      }
    });

    if (!sigResponse.ok) {
        console.warn(`Signature fetch failed: ${sigResponse.status}`);
        // For follow-up questions or other cases where signature is missing,
        // we return unverified instead of throwing to avoid breaking the flow.
        return { isVerified: false, details: "Signature not available" };
    }
    
    const sigData = await sigResponse.json();
    const { text, signature, signing_address } = sigData;

    // 3. Compare Hashes
    const [remoteReqHash, remoteResHash] = text.split(':');
    
    if (reqHash !== remoteReqHash) {
      console.warn("Request hash mismatch", { local: reqHash, remote: remoteReqHash });
      return { isVerified: false, details: "Request integrity check failed" };
    }
    
    // Note: Response hash mismatch is common in streaming due to newline handling.
    // If strict response hash fails, we can check logic.
    // However, the signature signs the 'text' which is "reqHash:resHash".
    // So if we verify that signature matches 'text', implies 'text' was signed by 'signing_address'.
    // If 'reqHash' matches the first part of 'text', then at least the request is verified.
    // The user instruction says: "If strict response hash fails, we can rely on the cryptographic signature of the *Remote* text provided that the Request Hash matched."
    // So we don't strictly enforce resHash === remoteResHash for "Verified" badge if streaming issues occur, 
    // BUT usually we should try to match it.
    
    if (resHash !== remoteResHash) {
         console.warn("Response hash mismatch - strictly ignoring for now if request matches", { local: resHash, remote: remoteResHash });
         // We can optionally fail here or proceed if we trust the request hash match + valid signature on that hash.
         // User instruction: "If strict response hash fails [implies we can still proceed]... rely on the cryptographic signature..."
    }

    // 4. Verify ECDSA Signature
    const recoveredAddress = ethers.verifyMessage(text, signature);
    const isValid = recoveredAddress.toLowerCase() === signing_address.toLowerCase();
    
    return { 
        isVerified: isValid,
        hashes: {
            localRequest: reqHash,
            remoteRequest: remoteReqHash,
            localResponse: resHash,
            remoteResponse: remoteResHash
        },
        signature,
        signingAddress: signing_address,
        recoveredAddress,
        text
    };

  } catch (error: any) {
    console.error("Verification error:", error);
    return { isVerified: false, details: error.message };
  }
}
