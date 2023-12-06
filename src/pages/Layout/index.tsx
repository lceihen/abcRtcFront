import JoinMeetModal from "@/components/JoinMeetModal";
import MeetRecordList from "@/components/MeetRecordList";
import styles from "./index.module.less";
import socket from "@/config/socketInstance";
import { message, Space, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
// useSelector是获取value的，const counterValue = useSelector(state => state.counter.value);
import { useSelector, useDispatch } from "react-redux";
import { getUserInfo } from "@/api";
import { handleSetUserInfo } from "@/store/user";
import { useNavigate } from "react-router-dom";
import { loginOutApi } from "@/api";

const Layout = () => {
  const navigate = useNavigate();

  const [meetRecordList, setMeetRecordList] = useState([]);

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   getUserInfo().then((res) => {
  //     if (res.code === "0") {
  //       dispatch(handleSetUserInfo(res.data));
  //     }
  //   });
  // }, []);

  const handleJoinRoom = (params = {}) => {
    // const initialValue = {
    //   audio: false,
    //   video: false,
    //   roomId: params.roomId ? params.roomId : null,
    //   roomName: params.roomName,
    //   operateType: params.operateType,
    //   roomType: params.roomType,
    // };

    // socket.emit("createOrJoinRoom", initialValue, (payload) => {
    //   console.log("payload-----", payload);
    //   if (payload.code === "0") {
    //     handleEntryRoom(payload.data);
    //     message.success("加入成功");
    //   } else {
    //     message.error(payload.message || "操作失败");
    //   }
    // });
    handleEntryRoom(params);
  };

  const handleLoginOut = async () => {
    await loginOutApi();
    setTimeout(() => {
      window.location.href = "/";
    });
  };

  const handleGetMeetRecordList = () => {
    socket.emit(
      "handleGetMeetRecordList",
      {},
      // {
      //   current: 1,
      //   pageSize: 10,
      // },
      (payload) => {
        if (payload.code === "0") {
          setMeetRecordList(payload.data);
        } else {
          message.warning("获取会议列表失败");
        }
      }
    );
  };

  const handleEntryRoom = (roomInfo) => {
    console.log("roomInfo", roomInfo);
    delete roomInfo.submit;
    navigate("/room", {
      state: { roomInfo: roomInfo },
    });
  };

  useEffect(() => {
    handleGetMeetRecordList();
  }, []);

  return (
    <>
      <section className={styles.contain}>
        <div className={styles.join_btn}>
          <Space size="middle">
            <JoinMeetModal
              submit={handleJoinRoom}
              operateType="join"
              btnLabel="加入会议"
            />
            <MeetRecordList
              // onOpenChange={handleGetMeetRecordList}
              data={meetRecordList}
              handleEntryRoom={handleEntryRoom}
            />
            <Button
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLoginOut}
            >
              Login out
            </Button>
          </Space>
        </div>

        <article className={styles.entry_contain}>
          <JoinMeetModal
            submit={handleJoinRoom}
            roomType="2"
            operateType="create"
            btnLabel={
              <div className={styles.entry_contain_item}>
                <i className="iconfont icon-DEM"></i>
                <span className={styles.entry_contain_item_title}>
                  两人会议
                </span>
              </div>
            }
          />
          <JoinMeetModal
            roomType="3"
            submit={handleJoinRoom}
            operateType="create"
            btnLabel={
              <div className={styles.entry_contain_item}>
                <i className="iconfont icon-DEM"></i>
                <span className={styles.entry_contain_item_title}>
                  多人会议
                </span>
              </div>
            }
          />
        </article>
      </section>
    </>
  );
};
export default Layout;
