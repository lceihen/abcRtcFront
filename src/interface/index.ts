export type UserInfo = {
  avatar: string;
  createdAt: string;
  email: string;
  gender: string;
  id: string;
  nickName: string;
  roomId: string;
  updatedAt: string;
  userName: string;
} | null;

export type ResponseData<T> = {
  data: T;
  total?: number;
  message?: string;
  code: string;
};
