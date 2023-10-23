import { useLocation, useNavigate } from "react-router-dom";
import { Switch, message, Space, Button, Result, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import {
  VideoCameraOutlined,
  DesktopOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";
import socket from "@/config/socketInstance";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

const { Text } = Typography;

let userInfo: any = null;

let mediaVideoSetting = {
  width: 640,
  height: 480,
};

let tracks: MediaStreamTrack | null = null;

let stream: MediaStream | null = null;

// let requestAnimationFrameRef = null;

const Peer_Connecttion_Map = {};

const Room = () => {
  const location: any = useLocation();
  const { state, videoAble = true, audioAble = true } = location || {};

  console.log("videoAble", videoAble, audioAble);

  const navigate = useNavigate();

  userInfo = useSelector((state: any) => {
    return state.UserInfoStore.userInfo;
  });

  const [canvasSetting, setCanvasSetting] = useState<
    Record<string, number | string>
  >({
    width: 960,
    height: 540,
  });

  const [isUserMedia, setIsUserMedia] = useState(false);

  const [isGetMediaAuth, setIsGetMediaAuth] = useState(null);

  const canvasRef = useRef<any>();
  const videoRef = useRef<any>();

  if (!state) {
    message.error("没有房间信息");
    setTimeout(() => {
      navigate("/");
    });
    return;
  }

  useEffect(() => {
    handleInitMedia();
  }, [isUserMedia]);

  useEffect(() => {
    // 2、reciver创建offer   4、 join收到offer 6、reciver接收answer
    socket.on("webrtc_dispatch_work", async (payload) => {
      const { reciverOffer, joinUuid } = payload || {};
      // 没有reciverOffer证明是房间的成员
      const isNullReciver = !reciverOffer ? true : false;

      const uuid = uuidv4();

      let currentPeerInstance = null;

      if (isNullReciver) {
        currentPeerInstance = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        });
        Peer_Connecttion_Map[uuid] = currentPeerInstance;
      } else {
        currentPeerInstance = Peer_Connecttion_Map[joinUuid];
      }

      tracks.forEach((track) => {
        currentPeerInstance.addTrack(track, stream);
      });

      let newOffer = null;

      //  有reciveroffer，没joinoffer证明是join接收reciver offer的过程
      if (isNullReciver) {
        newOffer = await currentPeerInstance.createOffer();
        console.log("设置本地offer", Date.now());
        await currentPeerInstance.setLocalDescription(newOffer);
      } else {
        console.log("设置远程offer", Date.now());
        await currentPeerInstance.setRemoteDescription(reciverOffer);
        newOffer = await currentPeerInstance.createAnswer();
        console.log("设置本地offer", Date.now());
        await currentPeerInstance.setLocalDescription(newOffer);
      }

      const param = isNullReciver
        ? {
            ...payload,
            reciverOffer: newOffer,
            reciverUuid: uuid,
          }
        : {
            ...payload,
            joinOffer: newOffer,
          };

      console.log("发送offer", param, Date.now());
      socket.emit("webrtc_dispatch_offer", param);
      currentPeerInstance.onicecandidate = (event) => {
        // 发送reciver的candidate
        if (event.candidate) {
          const param = {
            ...payload,
            candidate: event.candidate,
            reciverRole: isNullReciver,
          };
          console.log("发送candidate", param, Date.now());
          socket.emit("webrtc_setCandidate", param);
        }
      };

      currentPeerInstance.oniceconnectionstatechange = function (event) {
        if (currentPeerInstance.iceConnectionState === "disconnected") {
          console.log("处理 ICE 连接断开的情况");
          videoRef.current.srcObject = null;
        }
      };

      currentPeerInstance.ontrack = (track) => {
        // console.log("接收track", track, Date.now());
        // if (state.anchorRoomUserId === userInfo.id) return;

        videoRef.current.srcObject = track.streams[0];
        // videoRef.current.play();
        //     // requestAnimationFrameRef &&
        //     //   cancelAnimationFrame(requestAnimationFrameRef);

        //     // handleDrawCanvas();
      };
    });
    // reciver设置远程offer
    socket.on("webrtc_set_offer", (payload) => {
      console.log("设置远程offer", payload, Date.now());
      const { joinOffer, reciverUuid } = payload;
      const currentPeerInstance = Peer_Connecttion_Map[reciverUuid];
      currentPeerInstance.setRemoteDescription(joinOffer);
    });
    socket.on("webrtc_setCandidate", async (payload) => {
      console.log("设置candidate", Date.now(), payload);
      const { candidate, reciverRole, joinUuid, reciverUuid } = payload;
      const peerId = reciverRole ? joinUuid : reciverUuid;
      Peer_Connecttion_Map[peerId].addIceCandidate(candidate);
    });
  }, []);

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

    handleGetMedia
      .then(async (mediaStream) => {
        stream = mediaStream;
      })
      .catch((error) => {
        setIsGetMediaAuth(false);
        console.error("获取摄像头流失败：", error);
      })
      .finally(() => {
        console.log("stream", stream);

        tracks = stream.getVideoTracks();

        const videoTrack = tracks[0];
        const videoSettings = videoTrack.getSettings();
        console.log("videoSettings", videoSettings);
        socket.emit(
          "webrtc_join_socket_group",
          {
            roomId: state.id,
          },
          (payload = {}) => {
            const uuid = uuidv4();
            const currentPeerInstance = new RTCPeerConnection({
              iceServers: [
                {
                  urls: "stun:stun.l.google.com:19302",
                },
              ],
            });
            Peer_Connecttion_Map[uuid] = currentPeerInstance;
            socket.emit("webrtc_dispatch_work", {
              ...payload,
              joinUuid: uuid,
            });
          }
        );
        mediaVideoSetting = videoSettings;
        // const canvasWidth = canvasSetting.height * videoSettings.aspectRatio;

        console.log("视频宽度：" + mediaVideoSetting.width + " 像素");
        console.log("视频高度：" + mediaVideoSetting.height + " 像素");

        setCanvasSetting({
          width: mediaVideoSetting.width,
          height: mediaVideoSetting.height,
        });
        videoRef.current.srcObject = stream;
        setIsGetMediaAuth(true);
        handleDrawCanvas();
      });
  };

  const handleDrawCanvas = () => {
    const canvasContext = canvasRef.current.getContext("2d");
    // canvasContext.imageSmoothingEnabled = false;
    // canvasContext.globalCompositeOperation = "copy";
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
    videoRef.current.srcObject = null;
  };

  return (
    <section className={styles.page_container}>
      <article
        className={[styles.border_bottom_shadow, styles.header].join(" ")}
      >
        <Space size="middle">
          <Button icon={<ShareAltOutlined />}>
            <Text copyable ellipsis>
              {state.id}
            </Text>
          </Button>
          <Button onClick={handleStopScreenShare}>断开屏幕共享</Button>
          <Button onClick={handleInitMedia}>切换共享屏幕</Button>
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
          {/* {!isGetMediaAuth ? (
            <Result
              status="warning"
              title="You need to agreen the asked permission."
              className={styles.border_container_shadow}
              extra={
                <Button type="primary" key="console" onClick={handleInitMedia}>
                  Retry
                </Button>
              }
            />
          ) : null} */}
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
  );
};
export default Room;
