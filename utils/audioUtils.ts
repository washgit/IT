export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function decodeAudioData(
    base64: string,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
): Promise<AudioBuffer> {
    const buffer = base64ToArrayBuffer(base64);
    const dataInt16 = new Int16Array(buffer);
    const frameCount = dataInt16.length / numChannels;
    const audioBuffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert PCM16 to Float32
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return audioBuffer;
}

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Convert Float32 to PCM16
        int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    return {
        data: arrayBufferToBase64(int16.buffer),
        mimeType: 'audio/pcm;rate=16000',
    };
}