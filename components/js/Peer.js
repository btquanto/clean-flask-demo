class Peer {
    constructor(peerId, pcConfig, pcConstraints) {
        this.peerId = peerId;
        this.peerConnection = new RTCPeerConnection(pcConfig, pcConstraints);
    }
}

export default Peer;