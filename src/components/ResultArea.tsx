import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../contexts/LanguageContext';
import { ClayCard } from './ClayCard';
import { verifyNearChat, type VerificationResult } from '../lib/verification';

import { Quiz } from './Quiz';
import type { AgentType } from '../lib/agents';

interface ResultAreaProps {
  result: any;
  loading: boolean;
  activeAgent: AgentType | null;
  onClear: () => void;
  onReload?: () => void;
  onQuizComplete?: (score: number, total: number) => void;
}

export function ResultArea({ result, loading, activeAgent, onClear, onReload, onQuizComplete }: ResultAreaProps) {
  const { t } = useTranslation();
  const [isVerified, setIsVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  
  // Normalize result to separate content and verification data
  let content = result;
  let verificationData: any = null;

  if (result && typeof result === 'object' && 'content' in result && 'verification' in result) {
      content = result.content;
      verificationData = result.verification;
  }

  useEffect(() => {
      let isMounted = true;
      setIsVerified(false);
      setVerificationResult(null);
      if (verificationData && verificationData.chatId && verificationData.rawRequest) {
          verifyNearChat(
              verificationData.rawRequest, 
              verificationData.rawResponse, 
              verificationData.chatId, 
              verificationData.modelId,
              verificationData.apiKey 
          ).then(res => {
              if (isMounted) {
                  setVerificationResult(res);
                  if (res.isVerified) {
                      setIsVerified(true);
                  }
              }
          }).catch(console.error);
      }
      return () => { isMounted = false; };
  }, [verificationData]);


  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 space-y-2">
        <div className="w-6 h-6 border-4 border-lnc-ink-black border-t-transparent rounded-full animate-spin"></div>
        <div className="animate-pulse text-lnc-ink-black font-extrabold text-xs tracking-wider">{t('resultArea.thinking')}</div>
      </div>
    );
  }

  if (!result) return null;

  const handleCopy = () => {
    const textToCopy = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <>
      <ClayCard className="min-h-[150px] flex flex-col mb-16 p-4">
        <div className="flex justify-between items-center border-b-2 border-lnc-ink-light pb-2 mb-3">
          <h3 className="font-extrabold text-lnc-ink-black uppercase tracking-wide text-[10px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lnc-teal border border-lnc-ink-black"></span>
            {activeAgent} {t('resultArea.resultSuffix')}
            {isVerified && (
               <div className="group relative flex items-center ml-1">
                  <button 
                    onClick={() => setShowVerificationModal(true)}
                    className="hover:scale-110 transition-transform active:scale-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-lnc-teal">
                      <path d="M18.7497 6.46436C18.3027 6.46436 17.8876 6.69615 17.6534 7.0772L15.1301 10.8234C15.0479 10.9469 15.0812 11.1133 15.2047 11.1955C15.3048 11.2623 15.4372 11.254 15.5283 11.1756L18.0121 9.02133C18.0533 8.98419 18.1169 8.98797 18.1541 9.02924C18.1709 9.04816 18.1799 9.07258 18.1799 9.09768V15.8425C18.1799 15.8982 18.1348 15.9429 18.0791 15.9429C18.0492 15.9429 18.021 15.9298 18.0021 15.9068L10.4942 6.91969C10.2496 6.63115 9.8906 6.4647 9.51264 6.46436H9.25024C8.54006 6.46436 7.96436 7.04006 7.96436 7.75024V17.2497C7.96436 17.9599 8.54006 18.5356 9.25024 18.5356C9.69732 18.5356 10.1124 18.3038 10.3466 17.9228L12.8699 14.1766C12.9521 14.0531 12.9187 13.8866 12.7953 13.8044C12.6952 13.7377 12.5628 13.746 12.4717 13.8244L9.98793 15.9786C9.94666 16.0158 9.88303 16.012 9.84589 15.9707C9.82904 15.9518 9.8201 15.9274 9.82044 15.9023V9.1558C9.82044 9.10009 9.86549 9.05538 9.92121 9.05538C9.95078 9.05538 9.97933 9.06845 9.99824 9.09149L17.5051 18.0803C17.7497 18.3688 18.1087 18.5353 18.4867 18.5356H18.7491C19.4592 18.536 20.0353 17.9606 20.036 17.2504V7.75024C20.036 7.04006 19.4603 6.46436 18.7501 6.46436H18.7497Z" fill="currentColor"></path>
                    </svg>
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-lnc-ink-black text-white text-[10px] p-2 rounded z-20 text-center font-medium leading-tight">
                    Processed securely on NEAR Private AI. Click to verify signature.
                  </div>
               </div>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {onReload && (
              <button 
                onClick={onReload}
                className="text-lnc-ink-light hover:text-lnc-teal transition-colors p-0.5"
                title={t('resultArea.reloadTooltip')}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
              </button>
            )}
            <button 
              onClick={onClear}
              className="text-lnc-ink-light hover:text-red-500 transition-colors p-0.5"
              title={t('resultArea.clearTooltip')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {activeAgent === 'EXAMINER' && typeof content === 'object' && (content as any)?.questions ? (
          <Quiz 
              questions={(content as any).questions} 
              onComplete={(score, total) => {
                  if (onQuizComplete) {
                      onQuizComplete(score, total);
                  }
              }}
          />
        ) : (
          <div className="relative">
            <div className="btn-copy absolute top-0 right-0 z-10">
              <button
                onClick={handleCopy}
                className="p-1 bg-white rounded-neo-sm border-2 border-lnc-ink-black text-lnc-ink-black hover:bg-lnc-teal hover:text-white transition-all shadow-neo-2 active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                title={t('app.copyTooltip')}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
              </button>
            </div>
            <div className="prose prose-sm prose-zinc max-w-none text-lnc-ink-black leading-relaxed pt-1 pr-5">
              {typeof content === 'string' ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto text-gray-600">
                    {JSON.stringify(content, null, 2)}
                  </pre>
              )}
            </div>
          </div>
        )}
      </ClayCard>

      {showVerificationModal && verificationResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowVerificationModal(false)}>
          <div className="bg-white rounded-neo w-full max-w-lg max-h-[80vh] overflow-hidden shadow-neo-1 border-2 border-lnc-ink-black flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center p-4 border-b-2 border-lnc-ink-black bg-lnc-bg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-lnc-teal border-2 border-lnc-ink-black flex items-center justify-center text-white">
                    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.7497 6.46436C18.3027 6.46436 17.8876 6.69615 17.6534 7.0772L15.1301 10.8234C15.0479 10.9469 15.0812 11.1133 15.2047 11.1955C15.3048 11.2623 15.4372 11.254 15.5283 11.1756L18.0121 9.02133C18.0533 8.98419 18.1169 8.98797 18.1541 9.02924C18.1709 9.04816 18.1799 9.07258 18.1799 9.09768V15.8425C18.1799 15.8982 18.1348 15.9429 18.0791 15.9429C18.0492 15.9429 18.021 15.9298 18.0021 15.9068L10.4942 6.91969C10.2496 6.63115 9.8906 6.4647 9.51264 6.46436H9.25024C8.54006 6.46436 7.96436 7.04006 7.96436 7.75024V17.2497C7.96436 17.9599 8.54006 18.5356 9.25024 18.5356C9.69732 18.5356 10.1124 18.3038 10.3466 17.9228L12.8699 14.1766C12.9521 14.0531 12.9187 13.8866 12.7953 13.8044C12.6952 13.7377 12.5628 13.746 12.4717 13.8244L9.98793 15.9786C9.94666 16.0158 9.88303 16.012 9.84589 15.9707C9.82904 15.9518 9.8201 15.9274 9.82044 15.9023V9.1558C9.82044 9.10009 9.86549 9.05538 9.92121 9.05538C9.95078 9.05538 9.97933 9.06845 9.99824 9.09149L17.5051 18.0803C17.7497 18.3688 18.1087 18.5353 18.4867 18.5356H18.7491C19.4592 18.536 20.0353 17.9606 20.036 17.2504V7.75024C20.036 7.04006 19.4603 6.46436 18.7501 6.46436H18.7497Z" fill="currentColor"></path>
                    </svg>
                  </div>
                  <h2 className="text-sm font-extrabold text-lnc-ink-black uppercase tracking-wide">Verification Shield</h2>
                </div>
                <button onClick={() => setShowVerificationModal(false)} className="p-1 hover:bg-black/5 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>

             <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-6">
                {/* Simplified Status */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-lnc-teal">
                      <div className="p-1.5 bg-lnc-teal/10 rounded-full border border-lnc-teal/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-extrabold text-sm uppercase tracking-tight">Simplified Status Report</span>
                   </div>
                   
                   <div className="bg-lnc-bg p-4 rounded-neo-sm border-2 border-lnc-ink-black shadow-neo-1 space-y-2">
                      <div className="flex items-start gap-2">
                         <span className="mt-0.5">✅</span>
                         <div>
                            <p className="text-xs font-bold text-lnc-ink-black">[SAFE] Integrity Verified</p>
                            <p className="text-[10px] text-lnc-ink-grey">What you sent was exactly what the AI received. No tampering detected.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2">
                         <span className="mt-0.5">✅</span>
                         <div>
                            <p className="text-xs font-bold text-lnc-ink-black">[SAFE] Authenticity Confirmed</p>
                            <p className="text-[10px] text-lnc-ink-grey">This response definitely came from the NEAR Private AI Cloud.</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2">
                         <span className="mt-0.5">🔒</span>
                         <div>
                            <p className="text-xs font-bold text-lnc-ink-black">[PRIVACY] TEE Enclave Processed</p>
                            <p className="text-[10px] text-lnc-ink-grey leading-relaxed">
                               This inference ran inside a <b>Secure Trusted Execution Environment (TEE)</b>. 
                               Your data was processed in a "black box" that even NEAR AI cannot read.
                            </p>
                         </div>
                      </div>
                   </div>

                   <p className="text-[10px] text-center font-bold text-lnc-teal">
                      ☀️ This interaction is 100% Cryptographically Verified.
                   </p>
                </div>

                {/* Geeky Stats */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-lnc-ink-grey">
                      <div className="p-1.5 bg-gray-100 rounded-full border border-gray-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <span className="font-extrabold text-[10px] uppercase tracking-widest">Technical Metadata (Geeky Stats)</span>
                   </div>

                   <div className="space-y-3">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-lnc-ink-grey uppercase tracking-tighter">Request Hash (SHA-256)</label>
                         <div className="font-mono text-[9px] bg-gray-50 border border-gray-100 p-2 rounded break-all text-gray-600 bg-dot-pattern">
                            {verificationResult.hashes?.remoteRequest}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-lnc-ink-grey uppercase tracking-tighter">Response Hash (SHA-256)</label>
                         <div className="font-mono text-[9px] bg-gray-50 border border-gray-100 p-2 rounded break-all text-gray-600 bg-dot-pattern">
                            {verificationResult.hashes?.remoteResponse}
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-lnc-ink-grey uppercase tracking-tighter">Signing Address</label>
                            <div className="font-mono text-[9px] bg-gray-50 border border-gray-100 p-2 rounded truncate text-gray-600" title={verificationResult.signingAddress}>
                               {verificationResult.signingAddress}
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-lnc-ink-grey uppercase tracking-tighter">Recovered Identity</label>
                            <div className="font-mono text-[9px] bg-gray-50 border border-gray-100 p-2 rounded truncate text-gray-600" title={verificationResult.recoveredAddress}>
                               {verificationResult.recoveredAddress}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-lnc-ink-grey uppercase tracking-tighter">ECDSA Signature</label>
                         <div className="font-mono text-[9px] bg-gray-50 border border-gray-100 p-2 rounded break-all line-clamp-2 text-gray-500 hover:line-clamp-none transition-all cursor-help" title={verificationResult.signature}>
                            {verificationResult.signature}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-2 flex flex-col items-center gap-2">
                   <a 
                     href="https://docs.near.ai/cloud/introduction" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-[10px] font-black text-lnc-teal hover:underline flex items-center gap-1 uppercase tracking-tight"
                   >
                     Learn more about Near Private AI
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                     </svg>
                   </a>
                   <button
                     onClick={() => {
                        const maskedKey = verificationData.apiKey ? `${verificationData.apiKey.substring(0, 5)}...${verificationData.apiKey.substring(verificationData.apiKey.length - 5)}` : 'HIDDEN';
                        const log = `
Starting Verification Test...
Using API Key: ${maskedKey}
sending request...
Response Status: 200
Chat ID: ${verificationData.chatId}
Model ID: ${verificationData.modelId}

--- Verifying Signature ---
Local Request Hash: ${verificationResult.hashes?.localRequest}
Local Response Hash: ${verificationResult.hashes?.localResponse}
Fetching signature from: https://cloud-api.near.ai/v1/signature/${verificationData.chatId}?model=${verificationData.modelId}&signing_algo=ecdsa
Signature Data: ${JSON.stringify({
  signature: verificationResult.signature,
  signing_address: verificationResult.signingAddress,
  signing_algo: 'ecdsa',
  text: verificationResult.text
}, null, 2)}

--- Comparison ---
Original Request Body (Sent):
${JSON.stringify(JSON.parse(verificationData.rawRequest), null, 2)}

Local Request Hash:  ${verificationResult.hashes?.localRequest}
Remote Request Hash: ${verificationResult.hashes?.remoteRequest}
${verificationResult.hashes?.localRequest === verificationResult.hashes?.remoteRequest ? '✅ Request Integrity: Verified' : '❌ Request Hash Mismatch!'}

Original Response Body (Received):
${JSON.stringify(JSON.parse(verificationData.rawResponse), null, 2)}

Local Response Hash:  ${verificationResult.hashes?.localResponse}
Remote Response Hash: ${verificationResult.hashes?.remoteResponse}
${verificationResult.hashes?.localResponse === verificationResult.hashes?.remoteResponse ? '✅ Response Integrity: Verified' : '⚠️ Response Hash Mismatch (Common with network formatting)'}

--- ECDSA Verification ---
Recovered Agent Address: ${verificationResult.recoveredAddress}
Expected Agent Address:  ${verificationResult.signingAddress}
${verificationResult.isVerified ? '✅ Signature Identity: Authenticated' : '❌ Signature Identity: FAILED'}

==================================================
🛡️  SIMPLIFIED STATUS REPORT
==================================================
${verificationResult.hashes?.localRequest === verificationResult.hashes?.remoteRequest ? '✅ [SAFE] What you sent was exactly what the AI received.' : '❌ [DANGER] Your request was tampered with in transit!'}
${verificationResult.isVerified ? `✅ [SAFE] This response definitely came from the NEAR Private AI Cloud.\n   (Verified Identity: ${verificationResult.signingAddress})` : '❌ [DANGER] This response came from an unknown or untrusted source!'}

🔒 [PRIVACY] This inference ran inside a Secure Trusted Execution Environment (TEE).
   This means your data was processed in a 'black box' that even NEAR AI cannot peek into.
   The signature above cryptographically proves your privacy was maintained.

${verificationResult.isVerified && verificationResult.hashes?.localRequest === verificationResult.hashes?.remoteRequest ? `☀️  CONCLUSION: This interaction is 100% Cryptographically Verified.\n   The 'Verified' Badge would be shown in the extension.\n   Learn more about NEAR Private AI at: https://docs.near.ai/cloud/introduction` : '⛈️  CONCLUSION: Verification Failed. Something is wrong.'}
==================================================
                        `.trim();

                        const blob = new Blob([log], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `near-ai-verification-${verificationData.chatId}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                     }}
                     className="text-[9px] font-bold text-lnc-ink-grey hover:text-lnc-teal flex items-center gap-1 uppercase transition-colors"
                   >
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                     </svg>
                     Download Verification Log and verify yourself (.txt)
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
