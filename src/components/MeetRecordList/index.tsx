import { UnorderedListOutlined } from "@ant-design/icons";
import { DrawerForm } from "@ant-design/pro-components";
import { Button, Avatar, List, Typography } from "antd";
import dayjs from "dayjs";
const { Text } = Typography;

const MeetRecordList = (props) => {
  const { data, handleEntryRoom } = props || {};
  console.log("data", data);
  return (
    <DrawerForm<{
      name: string;
      company: string;
    }>
      title="历史会议"
      resize={{
        onResize() {
          console.log("resize!");
        },

        minWidth: 500,
      }}
      // onOpenChange={onOpenChange}
      trigger={
        <Button type="primary">
          <UnorderedListOutlined />
          历史会议
        </Button>
      }
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        pagination={{
          position: "bottom",
          align: "end",
        }}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <a
                key="list-loadmore-edit"
                onClick={() => {
                  const newItem = { ...item };
                  delete newItem.User;
                  handleEntryRoom && handleEntryRoom(newItem);
                }}
              >
                connect
              </a>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.User.avatar} />}
              title={<a href="https://ant.design">{item.roomName} </a>}
              description={
                <>
                  房间号:
                  <Text copyable ellipsis>
                    {item.id}
                  </Text>
                  <Text copyable ellipsis>
                    创建时间
                    {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </DrawerForm>
  );
};
export default MeetRecordList;
