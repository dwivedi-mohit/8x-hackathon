export class AudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private pendingPlay = false;

  attach(stream: MediaStream): HTMLAudioElement {
    this.detach();

    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.style.display = "none";
    document.body.appendChild(audio);
    this.audioElement = audio;

    // Attempt autoplay; if blocked by browser policy, queue for next user gesture
    this.tryPlay(audio);

    return audio;
  }

  detach(): void {
    this.pendingPlay = false;
    if (this.audioElement) {
      this.audioElement.srcObject = null;
      this.audioElement.remove();
      this.audioElement = null;
    }
  }

  get element(): HTMLAudioElement | null {
    return this.audioElement;
  }

  private tryPlay(audio: HTMLAudioElement): void {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — wait for user interaction
        this.pendingPlay = true;
        const handler = () => {
          this.pendingPlay = false;
          document.removeEventListener("click", handler);
          document.removeEventListener("touchstart", handler);
          document.removeEventListener("keydown", handler);
          if (this.audioElement === audio) {
            audio.play().catch(() => {
              // Still blocked — give up silently
            });
          }
        };
        document.addEventListener("click", handler, { once: true });
        document.addEventListener("touchstart", handler, { once: true });
        document.addEventListener("keydown", handler, { once: true });
      });
    }
  }
}
