export class AudioManager {
  private audioElement: HTMLAudioElement | null = null;

  attach(stream: MediaStream): HTMLAudioElement {
    this.detach();

    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.srcObject = stream;
    audio.style.display = "none";
    document.body.appendChild(audio);
    this.audioElement = audio;
    return audio;
  }

  detach(): void {
    if (this.audioElement) {
      this.audioElement.srcObject = null;
      this.audioElement.remove();
      this.audioElement = null;
    }
  }

  get element(): HTMLAudioElement | null {
    return this.audioElement;
  }
}
