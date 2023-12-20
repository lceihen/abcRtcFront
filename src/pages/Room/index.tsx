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
import {
  handleBindCandidateDisconnectEvent,
  handleBindCandidateForPeerConnection,
  handleBindStreamForPeerConnection,
  handleBindTrackForPeerConnection,
  handleClosePeerConnection,
  handleGenerateAnswer,
  handleGenerateOffer,
  handleGeneratePeerConnection,
  handleGetPeerConnection,
  handleSavePeerConnection,
} from "@/utils/rtcUtils";

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
    handleStopScreenShare();
    audioStream = null;
    videoStream = null;

    // PEERCONNECTION_MAP = [];
    videoTrack = null;
    audioTrack = null;
  };

  const handleInitConnect = async () => {
    console.clear();
    handleClosePeerConnection(PEERCONNECTION_MAP);
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
      handleBindCandidateDisconnectEvent(peerConnectionInstance);
      handleBindStreamForPeerConnection(peerConnectionInstance, stream);

      // 生成offer
      const offer = await handleGenerateOffer(peerConnectionInstance);
      // 绑定candidate
      handleBindCandidateForPeerConnection(
        peerConnectionInstance,
        targetUserId,
        sourceUserId,
        socket
      );

      // 保存peerConnection实例
      handleSavePeerConnection(
        sourceUserId,
        targetUserId,
        peerConnectionInstance,
        PEERCONNECTION_MAP
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

  const handleStopScreenShare = () => {
    handleClosePeerConnection(PEERCONNECTION_MAP);
    audioStream?.getTracks().forEach((track) => track.stop());
    videoStream?.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    socket.on("configOffer", async (payload, cb) => {
      console.log("configOffer----------");
      const { targetUserId, sourceUserId, offer } = payload;
      // const targetUserId = sourceUserId;
      // const sourceUserId = targetUserId;
      if (targetUserId === userInfo.id) {
        console.clear();
        const peerConnectionInstance = handleGeneratePeerConnection();
        handleBindCandidateDisconnectEvent(peerConnectionInstance);
        handleSavePeerConnection(
          sourceUserId,
          targetUserId,
          peerConnectionInstance,
          PEERCONNECTION_MAP
        );

        peerConnectionInstance.setRemoteDescription(offer);
        handleBindTrackForPeerConnection(peerConnectionInstance, videoRef);
        const answer = await handleGenerateAnswer(peerConnectionInstance);
        // 这里target和source id进行对换  ,向对方生成
        handleBindCandidateForPeerConnection(
          peerConnectionInstance,
          targetUserId,
          sourceUserId,
          socket
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
        console.clear();
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
              x-webkit-airplay="allow"
              webkit-playsinline="true"
              playsInline
              muted
              autoPlay
              x5-video-player-type="h5"
              x5-video-player-fullscreen="true"
              x5-video-orientation="portraint"
            ></video>
          </>
        </article>
      </section>
    </>
  );
};
export default Room;
