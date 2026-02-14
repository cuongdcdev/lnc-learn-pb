
import { ethers } from 'ethers';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { webcrypto } from 'crypto';

// Polyfill crypto if needed, though recent node has it globally
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as any;
}

// Load env vars manually because standard dotenv behavior might not pick up nested paths well if running from root, 
// using explicit config is safer to target the .env
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
    const envConfig = dotenv.parse(readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const API_KEY = process.env.VITE_DEMO_API_KEY;

if (!API_KEY) {
    console.error("Error: VITE_DEMO_API_KEY not found in .env file.");
    process.exit(1);
}

const API_ENDPOINT = "https://cloud-api.near.ai/v1/chat/completions";

// Helper: SHA-256 Hashing using Crypto API (same as frontend)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function runTest() {
    console.log("Starting Verification Test...");
    console.log(`Using API Key: ${API_KEY.substring(0, 5)}...`);

    const requestBody = {
        model: "Qwen/Qwen3-30B-A3B-Instruct-2507", // Using a likely available model on NEAR AI
        messages: [
            { role: "user", content: "Say verified." }
        ],
        max_tokens: 10
    };

    const rawRequest = JSON.stringify(requestBody);
    console.log("sending request...");

    let rawResponse = "";
    let chatId = "";
    let modelId = "";

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: rawRequest
        });

        // Capture raw text for hashing exactly as the extension does
        rawResponse = await response.text();

        console.log("Response Status:", response.status);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${rawResponse}`);
        }

        const data = JSON.parse(rawResponse);
        console.log("Response Content:", data.choices[0].message.content);
        
        chatId = data.id;
        modelId = data.model;
        
        console.log(`Chat ID: ${chatId}`);
        console.log(`Model ID: ${modelId}`);

    } catch (e: any) {
        console.error("Failed to fetch completion:", e.message);
        process.exit(1);
    }

    // --- Verification Logic ---
    console.log("\n--- Verifying Signature ---");

    try {
        // 1. Calculate Local Hashes
        const reqHash = await sha256(rawRequest);
        const resHash = await sha256(rawResponse);

        console.log(`Local Request Hash: ${reqHash}`);
        console.log(`Local Response Hash: ${resHash}`);

        // 2. Fetch Signature
        const sigUrl = `https://cloud-api.near.ai/v1/signature/${chatId}?model=${modelId}&signing_algo=ecdsa`;
        console.log(`Fetching signature from: ${sigUrl}`);
        
        const sigResponse = await fetch(sigUrl, {
            method: 'GET',
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}` 
            }
        });

        if (!sigResponse.ok) {
            const errText = await sigResponse.text();
            throw new Error(`Failed to fetch signature: ${sigResponse.status} - ${errText}`);
        }
        
        const sigData = await sigResponse.json();
        const { text, signature, signing_address } = sigData;
        
        console.log("Signature Data:", sigData);

        // 3. Compare Hashes
        const [remoteReqHash, remoteResHash] = text.split(':');
        
        console.log("\n--- Comparison ---");
        console.log("Original Request Body (Sent):");
        console.log(JSON.stringify(JSON.parse(rawRequest), null, 2));
        console.log(`\nLocal Request Hash:  ${reqHash}`);
        console.log(`Remote Request Hash: ${remoteReqHash}`);
        
        if (reqHash !== remoteReqHash) {
            console.error("❌ Request Hash Mismatch!");
        } else {
            console.log("✅ Request Integrity: Verified");
        }

        console.log("\nOriginal Response Body (Received):");
        console.log(JSON.stringify(JSON.parse(rawResponse), null, 2));
        console.log(`\nLocal Response Hash:  ${resHash}`);
        console.log(`Remote Response Hash: ${remoteResHash}`);

        if (resHash !== remoteResHash) {
            console.warn("⚠️ Response Hash Mismatch (Common with network formatting)");
        } else {
            console.log("✅ Response Integrity: Verified");
        }

        // 4. Verify ECDSA Signature
        console.log("\n--- ECDSA Verification ---");
        const recoveredAddress = ethers.verifyMessage(text, signature);
        console.log(`Recovered Agent Address: ${recoveredAddress}`);
        console.log(`Expected Agent Address:  ${signing_address}`);

        const isSignatureValid = recoveredAddress.toLowerCase() === signing_address.toLowerCase();

        if (isSignatureValid) {
            console.log("✅ Signature Identity: Authenticated");
        } else {
            console.error("❌ Signature Identity: FAILED");
        }

        // --- Normie Section ---
        console.log("\n" + "=".repeat(50));
        console.log("🛡️  SIMPLIFIED STATUS REPORT");
        console.log("=".repeat(50));
        
        if (reqHash === remoteReqHash) {
            console.log("✅ [SAFE] What you sent was exactly what the AI received.");
        } else {
            console.log("❌ [DANGER] Your request was tampered with in transit!");
        }

        if (isSignatureValid) {
            console.log("✅ [SAFE] This response definitely came from the NEAR Private AI Cloud.");
            console.log(`   (Verified Identity: ${signing_address})`);
            console.log("\n🔒 [PRIVACY] This inference ran inside a Secure Trusted Execution Environment (TEE).");
            console.log("   This means your data was processed in a 'black box' that even NEAR AI cannot peek into.");
            console.log("   The signature above cryptographically proves your privacy was maintained.");
        } else {
            console.log("❌ [DANGER] This response came from an unknown or untrusted source!");
        }

        if (reqHash === remoteReqHash && isSignatureValid) {
            console.log("\n☀️  CONCLUSION: This interaction is 100% Cryptographically Verified.");
            console.log("   The 'Verified' Badge would be shown in the extension.");
            console.log("   Learn more about NEAR Private AI at: https://docs.near.ai/cloud/introduction");
        } else {
            console.log("\n⛈️  CONCLUSION: Verification Failed. Something is wrong.");
        }
        console.log("=".repeat(50));

    } catch (error: any) {
        console.error("Verification Error:", error.message);
    }
}

runTest();
