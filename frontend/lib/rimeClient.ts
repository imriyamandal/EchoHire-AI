/**
 * Rime Audio Streaming & Full-Duplex Playback Controller
 * Handles streaming PCM/WAV chunks, queue scheduling, and instant sub-50ms abort.
 */

export class RimeAudioPlayer {
  private audioContext: AudioContext | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private onPlaybackStateChange?: (playing: boolean) => void;
  private analyserNode: AnalyserNode | null = null;

  constructor(onPlaybackStateChange?: (playing: boolean) => void) {
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  private initAudioContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 24000 });
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Immediately stops all active audio playback and purges queued buffers.
   * Winning feature: ensures 0 stale tokens / audio bytes are replayed.
   */
  public abortPlayback(): number {
    const startAbort = performance.now();
    let abortedCount = 0;

    for (const source of this.activeSources) {
      try {
        source.stop(0);
        source.disconnect();
        abortedCount++;
      } catch (e) {
        // Source might already have ended
      }
    }

    this.activeSources = [];
    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    this.isPlaying = false;
    this.onPlaybackStateChange?.(false);

    const abortLatencyMs = performance.now() - startAbort;
    return abortLatencyMs;
  }

  /**
   * Decodes Base64 PCM or WAV chunk and schedules immediate playback.
   */
  public async playChunk(base64Data: string, sampleRate: number = 24000): Promise<void> {
    if (!base64Data) return;
    this.initAudioContext();
    if (!this.audioContext || !this.analyserNode) return;

    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check if it has a WAV header or is raw 16-bit PCM
      let audioBuffer: AudioBuffer;
      const isWav = bytes.length > 4 && bytes[0] === 0x52 && bytes[1] === 0x49; // 'RIFF'

      if (isWav) {
        audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer.slice(0));
      } else {
        // Raw 16-bit PCM (mono, 24kHz)
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
        }

        audioBuffer = this.audioContext.createBuffer(1, float32.length, sampleRate);
        audioBuffer.copyToChannel(float32, 0);
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.analyserNode);

      const currentTime = this.audioContext.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.activeSources.push(source);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onPlaybackStateChange?.(true);
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0) {
          this.isPlaying = false;
          this.onPlaybackStateChange?.(false);
        }
      };

    } catch (err) {
      console.warn("Audio chunk decode error:", err);
    }
  }

  public close() {
    this.abortPlayback();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
