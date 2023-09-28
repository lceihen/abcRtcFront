import { ProTable } from "@ant-design/pro-components";
import ClientRecordModal from "./ClientRecordModal";
import { Card, Button, message } from "antd";

import { getClientList, handleDeleteClientRecordApi } from "@/api";
import { useRef } from "react";

export default () => {
  const tableRef = useRef<any>(null);
  const handleDeleteClientRecord = async (record) => {
    const { id } = record;
    const res = await handleDeleteClientRecordApi({ id });
    if (res?.code === "0") {
      message.success("删除成功");
      tableRef.current.reload();
      return;
    }
    message.error("删除失败");
  };
  const columns: any = [
    {
      dataIndex: "id",
      title: "id",
    },
    // {
    //   dataIndex: "name",
    //   title: "name",
    // },
    {
      dataIndex: "redirectUri",
      title: "redirectUri",
    },
    {
      dataIndex: "secret",
      title: "secret",
    },
    {
      dataIndex: "createdAt",
      title: "createdAt",
      width: 120,
    },
    {
      dataIndex: "updatedAt",
      title: "updatedAt",
      width: 120,
    },
    {
      dataIndex: "remark",
      title: "remark",
    },
    {
      title: "操作",
      render: (_: any, record: any) => {
        return (
          <>
            <ClientRecordModal
              data={record}
              type="update"
              callback={() => tableRef?.current?.reload()}
            />
            <Button
              danger
              style={{ marginLeft: 20 }}
              onClick={() => handleDeleteClientRecord(record)}
            >
              删除
            </Button>
          </>
        );
      },
    },
  ];
  return (
    <>
      <Card>
        <ClientRecordModal
          callback={() => tableRef?.current?.reload()}
          data={{}}
          type="create"
        />
      </Card>
      <ProTable
        columns={columns}
        actionRef={tableRef}
        request={async (params) => {
          console.log("params------", params);
          const res: any = await getClientList({
            pageSize: String(params?.pageSize),
            current: String(params?.current),
          });
          console.log("res-------", res);
          if (res?.code === "-1") {
            return {
              data: [],
              total: 0,
            };
          }
          return {
            data: res?.data,
            total: res?.total,
          };
        }}
        rowKey="id"
        search={false}
        form={{}}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
      />
    </>
  );
};
