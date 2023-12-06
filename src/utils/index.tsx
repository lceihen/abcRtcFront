export const isProd = import.meta.env.MODE === "production";

export const getType = (param: any) =>
  Object.prototype.toString.call(param).split(" ")[1].slice(0, -1);
