import { ModalForm } from "@ant-design/pro-form";
import { BetaSchemaForm } from "@ant-design/pro-form";
import { Button, message } from "antd";
import { createOrUpdateClientRecord } from "@/api";
export default (props: any) => {
  const { type, data = {}, callback } = props;
  const textForType = type === "create" ? "添加" : "编辑";
  const columns = [
    {
      title: "redirectUri",
      dataIndex: ["redirectUri"],
      name: "redirectUri",
      formItemProps: {
        rules: [{ required: true, message: "此项为必填项" }],
      },
    },

    {
      title: "remark",
      dataIndex: ["remark"],
      name: "remark",
    },
    {
      title: "secret",
      dataIndex: ["secret"],
      name: "secret",
    },
  ];

  return (
    <ModalForm
      width={500}
      trigger={
        <Button type={type === "create" ? "primary" : "dashed"}>
          {textForType}
        </Button>
      }
      initialValues={data}
      onFinish={async (value) => {
        const res: any = await createOrUpdateClientRecord({
          record: {
            ...data,
            ...value,
          },
        });
        if (res?.code === "-1") {
          message.warning("编辑失败");
          return false;
        }
        message.success(textForType + "成功");
        callback && callback();
        return true;
      }}
      onFinishFailed={() => {
        message.warning("请检查是否填写完整");
      }}
    >
      <BetaSchemaForm layoutType="Embed" columns={columns}></BetaSchemaForm>
    </ModalForm>
  );
};
