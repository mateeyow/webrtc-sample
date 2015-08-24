/*
 * Every time a user connects the following
 * functions are fired in order:
 * - createPeerConnections()
 * - addStreams()
 * - addDataChannels() --> for chat
 * - sendOffer()
 */

/*
 * 1. createPeerConnections()
 * - iterates over connected sockets 
 * - invokes createPeerConnection()
 *   - Creates new PeerConnection method
 */
rtc.createPeerConnection = function(id) {

  var config = rtc.pc_constraints;
  if (rtc.dataChannelSupport) config = rtc.dataChannelConfig;

  var pc = rtc.peerConnections[id] = new PeerConnection(rtc.SERVER(), config);
  pc.onicecandidate = function(event) {
    if (event.candidate) {
      rtc._socket.send(JSON.stringify({
        "eventName": "send_ice_candidate",
        "data": {
          "label": event.candidate.sdpMLineIndex,
          "candidate": event.candidate.candidate,
          "socketId": id
        }
      }));
    }
    // rtc.fire('ice candidate', event.candidate);
  };

  // pc.onopen = function() {
  //   // TODO: Finalize this API
  //   rtc.fire('peer connection opened');
  // };

  pc.onaddstream = function(event) {
    // TODO: Finalize this API
    rtc.fire('add remote stream', event.stream, id);
  };

  if (rtc.dataChannelSupport) {
    pc.ondatachannel = function(evt) {
      console.log('data channel connecting ' + id);
      rtc.addDataChannel(id, evt.channel);
    };
  }

  return pc;
};

/*
 * 
 */