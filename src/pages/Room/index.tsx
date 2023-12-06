import { useLocation, useNavigate } from "react-router-dom";
import {
  Switch,
  message,
  Space,
  Button,
  Typography,
  Spin,
  Skeleton,
} from "antd";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  VideoCameraOutlined,
  DesktopOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";
import socket from "@/config/socketInstance";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { UserInfo } from "@/interface";
import { getType } from "@/utils";

const { Text } = Typography;

let mediaVideoSetting = {
  width: 960,
  height: 720,
};

// let tracks: MediaStreamTrack | null = null;

// let requestAnimationFrameRef = null;
let PEERCONNECTION_MAP = {};
const Room = () => {
  let audioStream: MediaStream | null = null;

  let videoStream: MediaStream | null = null;

  let videoTrack = null;

  let audioTrack: any = null;

  const location: any = useLocation();

  const { state, videoAble = true, audioAble = true } = location || {};

  console.log("state--------", state);

  const { roomInfo } = state || {};

  let { roomId } = roomInfo || {};

  roomId = roomId || roomInfo.id;

  const navigate = useNavigate();

  const { userInfo } =
    useSelector((state: any) => {
      return state.UserInfoStore;
    }) || {};

  const [canvasSetting, setCanvasSetting] = useState<
    Record<string, number | string>
  >({
    width: 960,
    height: 540,
  });

  const [userListOfRoom, setUserListOfRoom] = useState([]);

  const [isUserMedia, setIsUserMedia] = useState(false);

  const canvasRef = useRef<any>();
  const videoRef = useRef<any>();

  const handleClearCacheValueBeforeConnect = (params) => {
    const { streams } = params || {};
    audioStream = null;
    videoStream = null;

    PEERCONNECTION_MAP = [];
    videoTrack = null;
    audioTrack = null;
    // streams?.forEach((stream) => releaseMeidaSource(stream));
  };

  const releaseMeidaSource = (mediaStream: MediaStream) => {
    mediaStream?.getTracks().forEach((track) => track.stop());
  };

  /**
   *
   * @returns 创建 RTCPeerConnection 实例
   */
  const handleGeneratePeerConnection = () => {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
  };

  /**
   *
   * @param peerConnectionInstance peerConnection实例
   * @returns offer
   */
  const handleGenerateOffer = async (peerConnectionInstance) => {
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
  const handleSavePeerConnection = (
    creatorUserId,
    reciverUserId,
    peerConnectionInstance
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
  const handleGetPeerConnection = (
    key1: string,
    key2: string,
    peerMap: Record<string, RTCPeerConnection>
  ) => {
    const key = key1 + key2;
    const newKey = key2 + key1;
    return peerMap[key] || peerMap[newKey];
  };

  /**
   * 为peerconnection增加ontrack事件
   * @param peerConnectionInstance
   */
  const handleBindTrackForPeerConnection = (
    peerConnectionInstance,
    videoRef
  ) => {
    peerConnectionInstance.ontrack = (track: RTCTrackEvent) => {
      console.log("ontrack------", track);
      videoRef.current.srcObject = track.streams[0];
    };
  };

  const handleBindCandidateForPeerConnection = (
    peerConnectionInstance,
    targetUserId,
    sourceUserId
  ) => {
    peerConnectionInstance.onicecandidate = (event) => {
      if (event.candidate) {
        const param = {
          candidate: event.candidate,
          targetUserId,
          sourceUserId,
        };
        console.log("start   relayCandidate-------", peerConnectionInstance);
        socket.emit("relayCandidate", param);
      }
    };
  };

  const handleGenerateAnswer = async (peerConnectionInstance) => {
    const answer = await peerConnectionInstance.createAnswer();
    peerConnectionInstance.setLocalDescription(answer);
    return answer;
  };

  const handleBindStreamForPeerConnection = (
    peerConnectionInstance,
    stream
  ) => {
    stream.getTracks().forEach((track) => {
      peerConnectionInstance.addTrack(track, stream);
    });
  };

  const handleInitConnect = async () => {
    handleClearCacheValueBeforeConnect({ streams: [audioStream, audioStream] });
    const stream = await handleInitMedia();

    videoRef.current.srcObject = stream;

    console.log("userListOfRoom instanceof Array", userListOfRoom);
    if (
      Boolean(!(userListOfRoom instanceof Array)) ||
      userListOfRoom.length < 2
    )
      return;
    const sourceUserId = userInfo.id;

    userListOfRoom.forEach(async (targetUserId: string) => {
      console.log("userId-----------", targetUserId, sourceUserId);
      if (targetUserId === sourceUserId) return;
      const peerConnectionInstance = handleGeneratePeerConnection();

      handleBindStreamForPeerConnection(peerConnectionInstance, stream);

      // 生成offer
      const offer = await handleGenerateOffer(peerConnectionInstance);
      // 绑定candidate
      handleBindCandidateForPeerConnection(
        peerConnectionInstance,
        targetUserId,
        sourceUserId
      );

      // 保存peerConnection实例
      handleSavePeerConnection(
        sourceUserId,
        targetUserId,
        peerConnectionInstance
      );
      socket.emit("relayOffer", {
        offer,
        sourceUserId,
        targetUserId,
      });
      handleBindTrackForPeerConnection(peerConnectionInstance, videoRef);
    });
  };

  const handleShareScreen = () => {
    handleInitMedia();
  };

  const handleGetAudio = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(function (_stream) {
          // 获取音频轨道
          audioStream = _stream;
          audioTrack = _stream.getAudioTracks()[0];

          videoRef.current.srcObject = _stream;
          resolve(null);
        })
        .catch(function (error) {
          reject();
        });
    });
  };

  const handleInitMedia = () => {
    const handleGetMedia = isUserMedia
      ? navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      : navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

    return new Promise((resolve, reject) => {
      handleGetMedia
        .then(async (mediaStream) => {
          if (!mediaStream) return;
          resolve(mediaStream);
          audioStream = mediaStream;
          // handleDrawCanvas();
        })
        .catch((error) => {
          reject();
          console.error("获取摄像头流失败：", error);
        });
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

  const handleStopScreenShare = () => {
    audioStream?.getTracks().forEach((track) => track.stop());
    // videoRef.current.srcObject = null;
  };

  useEffect(() => {
    socket.on("configOffer", async (payload, cb) => {
      console.log("configOffer----------");
      const { targetUserId, sourceUserId, offer } = payload;
      // const targetUserId = sourceUserId;
      // const sourceUserId = targetUserId;
      if (targetUserId === userInfo.id) {
        const peerConnectionInstance = handleGeneratePeerConnection();
        handleSavePeerConnection(
          sourceUserId,
          targetUserId,
          peerConnectionInstance
        );

        peerConnectionInstance.setRemoteDescription(offer);
        handleBindTrackForPeerConnection(peerConnectionInstance, videoRef);
        const answer = await handleGenerateAnswer(peerConnectionInstance);
        // 这里target和source id进行对换  ,向对方生成
        handleBindCandidateForPeerConnection(
          peerConnectionInstance,
          targetUserId,
          sourceUserId
        );

        cb &&
          cb({
            offer: answer,
            sourceUserId: sourceUserId,
            targetUserId: targetUserId,
          });
      } else {
        const peerConnectionInstance = handleGetPeerConnection(
          targetUserId,
          sourceUserId,
          PEERCONNECTION_MAP
        );
        console.log("setRemoteDescription");
        peerConnectionInstance.setRemoteDescription(offer);
      }
    });

    socket.on("configCandidate", async (payload) => {
      console.log("configCandidate-----------");
      const { targetUserId, sourceUserId, candidate } = payload || {};
      const peerConnectionInstance = handleGetPeerConnection(
        targetUserId,
        sourceUserId,
        PEERCONNECTION_MAP
      );
      if (!peerConnectionInstance) {
        return;
      }
      peerConnectionInstance.addIceCandidate(candidate);
    });
  }, []);

  useEffect(() => {
    socket.emit(
      "joinWebRtcRoom",
      {
        roomId: roomId,
      },
      (payload) => {
        const { userListOfRoom } = payload || {};
        setUserListOfRoom(userListOfRoom);
        console.log("加入房间成功", userListOfRoom);
      }
    );
  }, []);

  if (!roomInfo) {
    message.error("没有房间信息");
    setTimeout(() => {
      navigate("/");
    });
    return;
  }

  return (
    <>
      <section className={styles.page_container}>
        <article
          className={[styles.border_bottom_shadow, styles.header].join(" ")}
        >
          <Space size="middle">
            <Button icon={<ShareAltOutlined />}>
              <Text copyable ellipsis>
                {roomId}
              </Text>
            </Button>

            {/* <Button onClick={handleShareScreen}>开启屏幕共享</Button>
           
            <Button onClick={handleInitMedia}>切换共享屏幕</Button>
        
            <Button onClick={handleGetAudio}>连接音频</Button> */}
            <Button onClick={handleStopScreenShare}>断开连接</Button>
            <Button onClick={handleInitConnect}>开始连接</Button>
            <Switch
              checked={isUserMedia}
              checkedChildren={
                <Space>
                  摄像头模式
                  <VideoCameraOutlined />
                </Space>
              }
              unCheckedChildren={
                <Space>
                  桌面模式
                  <DesktopOutlined />
                </Space>
              }
              onChange={(value) => setIsUserMedia(value)}
            ></Switch>
          </Space>
        </article>

        <article className={styles.payer_container}>
          <>
            <canvas
              ref={canvasRef}
              id="canvas"
              width={canvasSetting.width}
              height={canvasSetting.height}
              className={[
                styles.canvas,
                isUserMedia ? styles.self_mirror : "",
                styles.border_container_shadow,
              ].join(" ")}
            ></canvas>
            <video
              ref={videoRef}
              id="video"
              className={styles.video}
              autoPlay
            ></video>
          </>
        </article>
      </section>
    </>
  );
};
export default Room;
