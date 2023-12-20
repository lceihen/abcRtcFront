/**
 *
 * @returns 创建 RTCPeerConnection 实例
 */
export const handleGeneratePeerConnection = () => {
  const result = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  // setInterval(() => {
  //   console.log(
  //     "handleGeneratePeerConnection",
  //     result.signalingState,
  //     result
  //   );
  // }, 50);
  return result;
};

export const handleBindCandidateDisconnectEvent = (
  peerConnectionInstance: RTCPeerConnection
) => {
  peerConnectionInstance.addEventListener("iceconnectionstatechange", () => {
    console.log("ICE连接状态变化:", peerConnectionInstance.iceConnectionState);

    if (peerConnectionInstance.iceConnectionState === "disconnected") {
      // 处理连接断开的情况
      console.log("ICE连接已断开");
    }
  });
};

/**
 *
 * @param peerConnectionInstance peerConnection实例
 * @returns offer
 */
export const handleGenerateOffer = async (peerConnectionInstance) => {
  const offer = await peerConnectionInstance.createOffer();
  await peerConnectionInstance.setLocalDescription(offer);
  return offer;
};

/**
 *
 * @param creatorUserId 创建者的userId
 * @param reciverUserId 接收者的userid
 * @param peerConnectionInstance peerConnection实例
 */
export const handleSavePeerConnection = (
  creatorUserId,
  reciverUserId,
  peerConnectionInstance,
  PEERCONNECTION_MAP
) => {
  const key = creatorUserId + reciverUserId;
  PEERCONNECTION_MAP[key] = peerConnectionInstance;
};

/**
 *
 * @param key1 用户id
 * @param key2 用户id
 * @param peerMap peerconnection的map数据
 * @returns
 */
export const handleGetPeerConnection = (
  key1: string,
  key2: string,
  peerMap: Record<string, RTCPeerConnection>
) => {
  const key = key1 + key2;
  const newKey = key2 + key1;
  console.log("handleGetPeerConnection-------", peerMap[key], peerMap[newKey]);

  return peerMap[key] || peerMap[newKey];
};

/**
 * 为peerconnection增加ontrack事件
 * @param peerConnectionInstance
 */
export const handleBindTrackForPeerConnection = (
  peerConnectionInstance,
  videoRef
) => {
  peerConnectionInstance.ontrack = (track: RTCTrackEvent) => {
    console.log(
      "ontrack------",
      track,
      videoRef.current.srcObject,
      track.streams[0]
    );

    videoRef.current.srcObject = track.streams[0];

    console.log("+++++++++++++", videoRef.current.srcObject);
  };
};

/**
 * 关闭rtc连接
 * @param peerConnectionMap peerconnection 列表
 */
export const handleClosePeerConnection = (
  peerConnectionMap: Record<string, RTCPeerConnection>
) => {
  Object.entries(peerConnectionMap).forEach(([key, item]) => {
    item.close();
    delete peerConnectionMap[key];
  });
};

export const handleBindCandidateForPeerConnection = (
  peerConnectionInstance,
  targetUserId,
  sourceUserId,
  socket
) => {
  peerConnectionInstance.onicecandidate = (event) => {
    if (event.candidate) {
      const param = {
        candidate: event.candidate,
        targetUserId,
        sourceUserId,
      };
      console.log("start   relayCandidate-------");
      socket.emit("relayCandidate", param);
    }
  };
};

export const handleGenerateAnswer = async (peerConnectionInstance) => {
  const answer = await peerConnectionInstance.createAnswer();
  peerConnectionInstance.setLocalDescription(answer);
  return answer;
};

export const handleBindStreamForPeerConnection = (
  peerConnectionInstance,
  stream
) => {
  stream.getTracks().forEach((track) => {
    peerConnectionInstance.addTrack(track, stream);
  });
};

const handleDrawCanvas = () => {
  const canvasContext = canvasRef.current.getContext("2d");
  // canvasContext.imageSmoothingEnabled = false;
  // canvasContext.globalCompositeOperation = "copy";
  if (!videoRef.current.srcObject) return;
  canvasContext.drawImage(
    videoRef.current,
    0,
    0,
    mediaVideoSetting.width,
    mediaVideoSetting.height
  );
  requestAnimationFrame(handleDrawCanvas);
};
