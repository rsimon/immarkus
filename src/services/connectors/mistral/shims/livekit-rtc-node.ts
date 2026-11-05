/**
 * Although it doesn't document this, the Mistral SDK pulls in all sorts of 
 * unwanted optional dependencies... Rather than installing them, we mock them here.
 */
export const AudioFrame = undefined, AudioSource = undefined, AudioStream = undefined,
  ConnectError = undefined, DisconnectReason = undefined, LocalAudioTrack = undefined,
  ParticipantKind = undefined, Room = undefined, RoomEvent = undefined, RpcError = undefined,
  TrackKind = undefined, TrackPublishOptions = undefined, TrackSource = undefined;