import { Button, message } from "antd";
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormSwitch,
} from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";

const JoinMeetModal = (props) => {
  const { submit, operateType = "join", btnLabel } = props;

  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title={operateType === "join" ? "加入会议" : "创建会议"}
      trigger={
        operateType === "join" ? (
          <Button type="primary">
            <PlusOutlined />
            {btnLabel}
          </Button>
        ) : (
          btnLabel
        )
      }
      width={400}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => console.log("run"),
      }}
      onFinish={(values) =>
        submit &&
        submit({
          ...props,
          ...values,
        })
      }
      onFinishFailed={() => {
        message.warning("请检查是否填写完整");
      }}
    >
      <ProForm.Group>
        {operateType === "create" ? (
          <ProFormText
            width="md"
            name="roomName"
            label="会议名称"
            required
            rules={[
              {
                required: true,
              },
            ]}
          />
        ) : (
          <ProFormText
            width="md"
            name="roomId"
            label="会议号"
            required
            rules={[
              {
                required: true,
              },
            ]}
          />
        )}
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSwitch
          name="video"
          width="md"
          label="是否开启视频"
          fieldProps={{
            defaultChecked: true,
          }}
        ></ProFormSwitch>

        <ProFormSwitch
          name="audio"
          width="md"
          label="是否开启音频"
          fieldProps={{
            defaultChecked: true,
          }}
        ></ProFormSwitch>
      </ProForm.Group>
    </ModalForm>
  );
};

export default JoinMeetModal;
