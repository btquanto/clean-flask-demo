import Peer from 'Components/Peer';

class PeerManager {
    constructor(options) {
        this.config = {
            pcConfig: {
                iceServers: [
                    { "url": "stun:23.21.150.121" },
                    { "url": "stun:stun.l.google.com:19302" }
                ],
                rtcpMuxPolicy: "require"
            },
            pcConstraints: {
                optional: [{
                    DtlsSrtpKeyAgreement: true
                }]
            },
            sdpConstraints: {
                mandatory: {
                    OfferToReceiveAudio: true,
                    OfferToReceiveVideo: true
                }
            }
        };

        this.options = Object.assign({
            onIceCandidate: (event, peerId) => { },
            onAddStream: (event, peerId) => { },
            onRemoveStream: (event, peerId) => { },
            onIceConnectionStateChange: (event, peerId) => { },
            signalRTCMessage: (target, type, extras) => {}
        }, options);

        this.peers = {};
        this.localStream = null;

        this.getPeer = this.getPeer.bind(this);
        this.addPeer = this.addPeer.bind(this);
        this.removePeer = this.removePeer.bind(this);
        this.answer = this.answer.bind(this);
        this.offer = this.offer.bind(this);
        this.setLocalStream = this.setLocalStream.bind(this);
        this.toggleLocalStream = this.toggleLocalStream.bind(this);
    }

    getPeer(peerId) {
        return this.peers[peerId];
    }

    addPeer(peerId) {
        let peer = new Peer(peerId, this.config.pcConfig, this.config.pcConstraints);
        let pc = peer.peerConnection;
        pc.onicecandidate = event => this.options.onIceCandidate(event, peerId);
        pc.onaddstream = event => this.options.onAddStream(event, peerId);
        pc.onRemoveStream = event => this.options.onRemoveStream(event, peerId);
        pc.oniceconnectionstatechange = event => this.options.onIceConnectionStateChange(event, peerId);

        this.peers[peerId] = peer;
    }

    removePeer(peerId) {
        delete this.peers[peerId];
    }

    answer(peerId) {
        let peerConnection = this.peers[peerId].peerConnection;
        let signalRTCMessage = this.options.signalRTCMessage;

        peerConnection.createAnswer(this.config.sdpConstraints)
                        .then(sessionDescription => {
            return peerConnection.setLocalDescription(sessionDescription)
                                    .then(() => signalRTCMessage(peerId, 'answer', sessionDescription))
                                    .catch(console.log);
        }).catch(console.log);
    }

    offer(peerId) {
        let peerConnection = this.peers[peerId].peerConnection;
        let signalRTCMessage = this.options.signalRTCMessage;
        peerConnection.createOffer()
            .then(sessionDescription => {
                return peerConnection.setLocalDescription(sessionDescription)
                    .then(() => signalRTCMessage(peerId, 'offer', sessionDescription))
                    .catch(console.log);
            }).catch(console.log);
    }

    setLocalStream(stream) {
        if (!stream) {
            for (let peerId of Object.keys(this.peers)) {
                let peer = this.peers[peerId];
                if (!!peer.peerConnection.getLocalStreams().length) {
                    peer.peerConnection.removeStream(this.localStream);
                }
            }
        }
        this.localStream = stream;
    }

    toggleLocalStream(peerId) {
        let peer = this.peers[peerId];
        let isEnabled = "N/A";
        if (this.localStream) {
            if (!!peer.peerConnection.getLocalStreams().length) {
                isEnabled = false;
                peer.peerConnection.removeStream(this.localStream);
            } else {
                isEnabled = true;
                peer.peerConnection.addStream(this.localStream);
            }
        }
    }
}

export default PeerManager;