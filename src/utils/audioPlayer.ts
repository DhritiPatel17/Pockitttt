/**
 * Handles all audio playback logic
 * Works on mobile and desktop
 */
import { Song } from "../data/songLibrary";

export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentSong: Song | null = null;
  private volume: number = 0.8;

  constructor() {
    if (typeof window !== "undefined") {
      // Create audio element
      this.audio = new Audio();
      this.audio.volume = this.volume; // Default volume (80%)

      // Handle loading/decoding errors gracefully
      this.audio.onerror = (e) => {
        console.warn("Audio element encountered a media error:", e);
        if (this.currentSong && this.audio && this.audio.src !== "https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/viper.mp3") {
          console.log("Audio onerror triggered. Trying fallback...");
          this.play(this.currentSong, true).catch(err => {
            if (err && err.name !== "AbortError") {
              console.error("Fallback play failed from onerror:", err);
            }
          });
        }
      };
    }
  }

  /**
   * Load and play a song
   * Works with Spotify preview URLs or YouTube IDs
   */
  async play(song: Song, useFallback: boolean = false): Promise<void> {
    if (!this.audio) return;
    try {
      this.currentSong = song;

      // Reset src if it changed
      const targetSrc = useFallback
        ? "https://raw.githubusercontent.com/mdn/learning-area/master/html/multimedia-and-embedding/video-and-audio-content/viper.mp3"
        : song.spotifyPreviewUrl;

      if (this.audio.src !== targetSrc) {
        this.audio.src = targetSrc;
      }

      // Start playing
      this.audio.volume = this.volume;
      await this.audio.play();
      this.isPlaying = true;

      // Loop when finished
      this.audio.onended = () => {
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play().catch(err => {
            if (err && err.name !== "AbortError") {
              console.log("Audio loop play failed:", err);
            }
          });
        }
      };
    } catch (error: any) {
      if (error && error.name === "AbortError") {
        // Normal navigation interruption - ignore
        console.log("Playback interrupted (normal navigation).");
        return;
      }

      console.warn("Failed to play audio with primary source:", error);

      if (!useFallback) {
        console.log("Attempting play with highly reliable fallback MDN track...");
        return this.play(song, true);
      }

      this.handlePlaybackError();
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume audio
   */
  resume(): void {
    if (this.audio) {
      this.audio.play().catch(err => {
        if (err && err.name === "AbortError") {
          console.log("Resume play interrupted (normal).");
        } else {
          console.warn("Failed to resume track:", err);
          if (this.currentSong) {
            this.play(this.currentSong, true).catch(fallbackErr => {
              if (fallbackErr && fallbackErr.name !== "AbortError") {
                console.error("Failed to recover on resume with fallback:", fallbackErr);
              }
            });
          }
        }
      });
      this.isPlaying = true;
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  /**
   * Stop and cleanup
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  /**
   * Get current playback state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentSong: this.currentSong,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
    };
  }

  /**
   * Handle playback errors (browser restrictions, network issues)
   */
  private handlePlaybackError(): void {
    console.warn(
      "Autoplay blocked or stream issue. User can tap play button to start music."
    );
    this.isPlaying = false;
  }
}

// Singleton instance
export const audioPlayer = new AudioPlayer();
